import { asc, db, eq, tags } from "@pontistudios/db";
import type { TagItem } from "~/lib/tags";

const DEMO_USER_ID = "demo-user";

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

export async function loader() {
  try {
    const rows = await db
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
      .where(eq(tags.userId, DEMO_USER_ID))
      .orderBy(asc(tags.name));

    return Response.json(rows.map(toTagItem));
  } catch (error) {
    console.error("Error fetching tags:", error);
    return Response.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}
