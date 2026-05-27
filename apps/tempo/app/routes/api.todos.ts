import {
  and,
  db,
  desc,
  eq,
  inArray,
  tags,
  todoTags,
  todos,
} from "@pontistudios/db";
import { DEFAULT_TAG_COLOR, normalizeTagName, type TagItem } from "~/lib/tags";

const DEMO_USER_ID = "demo-user";

interface TodoItem {
  id: number;
  userId: string;
  title: string;
  start: string;
  end: string;
  completed: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  tags: TagItem[];
}

interface TodoCreateData {
  title: string;
  start: string;
  end: string;
  completed: boolean;
  tags: string[];
}

function toIsoString(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function toTagItem(row: {
  id: number;
  userId: string;
  name: string;
  normalizedName: string;
  color: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}): TagItem {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    normalizedName: row.normalizedName,
    color: row.color,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

function toTodoItem(
  row: {
    id: number;
    userId: string;
    title: string;
    start: string;
    end: string;
    completed: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  },
  todoTagsForRow: TagItem[],
): TodoItem {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    start: row.start,
    end: row.end,
    completed: Boolean(row.completed),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
    tags: todoTagsForRow,
  };
}

function normalizeRequestedTags(values: string[]): string[] {
  const deduped = new Set<string>();

  for (const value of values) {
    const normalized = normalizeTagName(value);
    if (normalized) {
      deduped.add(normalized);
    }
  }

  return Array.from(deduped);
}

async function fetchTagsForTodos(todoIds: number[]): Promise<Map<number, TagItem[]>> {
  if (todoIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      todoId: todoTags.todoId,
      id: tags.id,
      userId: tags.userId,
      name: tags.name,
      normalizedName: tags.normalizedName,
      color: tags.color,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
    })
    .from(todoTags)
    .innerJoin(tags, eq(todoTags.tagId, tags.id))
    .where(inArray(todoTags.todoId, todoIds));

  const grouped = new Map<number, TagItem[]>();

  for (const row of rows) {
    const existing = grouped.get(row.todoId) ?? [];
    existing.push(toTagItem(row));
    grouped.set(row.todoId, existing);
  }

  for (const [todoId, todoTagItems] of grouped) {
    grouped.set(
      todoId,
      [...todoTagItems].sort((left, right) => left.name.localeCompare(right.name)),
    );
  }

  return grouped;
}

async function resolveTagsForUser(tagValues: string[]): Promise<TagItem[]> {
  const normalizedNames = normalizeRequestedTags(tagValues);

  if (normalizedNames.length === 0) {
    return [];
  }

  const existingRows = await db
    .select({
      id: tags.id,
      userId: tags.userId,
      name: tags.name,
      normalizedName: tags.normalizedName,
      color: tags.color,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
    })
    .from(tags)
    .where(
      and(
        eq(tags.userId, DEMO_USER_ID),
        inArray(tags.normalizedName, normalizedNames),
      ),
    );

  const existingByNormalizedName = new Map(
    existingRows.map((row) => [row.normalizedName, toTagItem(row)]),
  );

  const resolved: TagItem[] = [];

  for (const normalizedName of normalizedNames) {
    const existing = existingByNormalizedName.get(normalizedName);
    if (existing) {
      resolved.push(existing);
      continue;
    }

    const [createdTag] = await db
      .insert(tags)
      .values({
        userId: DEMO_USER_ID,
        name: normalizedName,
        normalizedName,
        color: DEFAULT_TAG_COLOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: tags.id,
        userId: tags.userId,
        name: tags.name,
        normalizedName: tags.normalizedName,
        color: tags.color,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
      });

    const tagItem = toTagItem(createdTag);
    existingByNormalizedName.set(normalizedName, tagItem);
    resolved.push(tagItem);
  }

  return resolved;
}

async function replaceTodoTagLinks(todoId: number, tagIds: number[]) {
  await db.delete(todoTags).where(eq(todoTags.todoId, todoId));

  if (tagIds.length === 0) {
    return;
  }

  await db.insert(todoTags).values(
    tagIds.map((tagId) => ({
      todoId,
      tagId,
      createdAt: new Date(),
    })),
  );
}

export async function loader() {
  try {
    const rows = await db
      .select({
        id: todos.id,
        userId: todos.userId,
        title: todos.title,
        start: todos.start,
        end: todos.end,
        completed: todos.completed,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
      })
      .from(todos)
      .where(eq(todos.userId, DEMO_USER_ID))
      .orderBy(desc(todos.createdAt));

    const todoTagMap = await fetchTagsForTodos(rows.map((row) => row.id));

    return Response.json(
      rows.map((row) => toTodoItem(row, todoTagMap.get(row.id) ?? [])),
    );
  } catch (error) {
    console.error("Error fetching todos:", error);
    return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  try {
    switch (request.method) {
      case "POST": {
        const body = (await request.json()) as TodoCreateData;
        const resolvedTags = await resolveTagsForUser(body.tags ?? []);

        const [todo] = await db
          .insert(todos)
          .values({
            userId: DEMO_USER_ID,
            title: body.title,
            start: body.start,
            end: body.end,
            completed: body.completed ? 1 : 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        await replaceTodoTagLinks(todo.id, resolvedTags.map((tag) => tag.id));

        return Response.json(toTodoItem(todo, resolvedTags));
      }

      case "PUT": {
        const body = (await request.json()) as TodoItem & { tags: string[] | TagItem[] };
        const requestedTagValues = (body.tags ?? []).map((tagValue) =>
          typeof tagValue === "string" ? tagValue : tagValue.name,
        );
        const resolvedTags = await resolveTagsForUser(requestedTagValues);

        const [todo] = await db
          .update(todos)
          .set({
            title: body.title,
            start: body.start,
            end: body.end,
            completed: body.completed ? 1 : 0,
            updatedAt: new Date(),
          })
          .where(and(eq(todos.id, body.id), eq(todos.userId, DEMO_USER_ID)))
          .returning();

        if (!todo) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }

        await replaceTodoTagLinks(todo.id, resolvedTags.map((tag) => tag.id));

        return Response.json(toTodoItem(todo, resolvedTags));
      }

      case "DELETE": {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
          return Response.json({ error: "Todo ID is required" }, { status: 400 });
        }

        const [deleted] = await db
          .delete(todos)
          .where(and(eq(todos.id, Number(id)), eq(todos.userId, DEMO_USER_ID)))
          .returning({ id: todos.id });

        if (!deleted) {
          return Response.json({ error: "Todo not found" }, { status: 404 });
        }

        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Error in todo action:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
