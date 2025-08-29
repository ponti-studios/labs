import { eq } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { db, embeddings, projects, todos } from "~/db";
import type { TodoInsert } from "~/db/schema";
import { generateTaskEmbedding } from "~/lib/embeddings";
import { commitSession, getSession } from "~/lib/session";

async function getOrCreateUserId(
	request: Request,
): Promise<{ userId: string; session: any }> {
	const session = await getSession(request.headers.get("Cookie"));
	let userId = session.get("userId");

	if (!userId) {
		userId = `session_${Date.now()}_${crypto.randomUUID()}`;
		session.set("userId", userId);
	}

	return { userId, session };
}

async function createResponseWithSession(data: any, session: any) {
	return Response.json(data, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

async function fetchUserTodos(userId: string) {
	return await db
		.select({
			id: todos.id,
			userId: todos.userId,
			projectId: todos.projectId,
			title: todos.title,
			start: todos.start,
			end: todos.end,
			completed: todos.completed,
			createdAt: todos.createdAt,
			updatedAt: todos.updatedAt,
			projectName: projects.name,
		})
		.from(todos)
		.leftJoin(projects, eq(todos.projectId, projects.id))
		.where(eq(todos.userId, userId))
		.orderBy(todos.createdAt);
}

async function createTodo(todoData: TodoInsert, userId: string) {
	// Create the todo first
	const newTodo = await db
		.insert(todos)
		.values({
			...todoData,
			userId,
		})
		.returning()
		.then((rows) => rows[0]);

	// Generate and save embedding asynchronously (don't block the response)
	try {
		// Get project name if projectId is provided
		let projectName: string | undefined;
		if (todoData.projectId) {
			const project = await db
				.select({ name: projects.name })
				.from(projects)
				.where(eq(projects.id, todoData.projectId))
				.then((rows) => rows[0]);
			projectName = project?.name;
		}

		// Generate embedding
		const embeddingValues = await generateTaskEmbedding(
			todoData.title,
			projectName,
		);

		// Save embedding to database
		await db.insert(embeddings).values({
			todoId: newTodo.id,
			content: projectName
				? `Task: ${todoData.title} | Project: ${projectName}`
				: `Task: ${todoData.title}`,
			embedding: embeddingValues,
			model: "gemini-embedding-001",
		});

		console.log(`Embedding saved for todo ${newTodo.id}`);
	} catch (error) {
		console.error(
			"Failed to generate/save embedding for todo:",
			newTodo.id,
			error,
		);
		// Don't fail the todo creation if embedding fails
	}

	return newTodo;
}

async function updateTodo(
	todoData: TodoInsert & { id: number },
	userId: string,
) {
	return await db
		.update(todos)
		.set({
			...todoData,
			userId,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(todos.id, todoData.id))
		.returning()
		.then((rows) => rows[0]);
}

async function deleteTodo(todoId: number) {
	return await db
		.delete(todos)
		.where(eq(todos.id, todoId))
		.returning()
		.then((rows) => rows[0]);
}

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const { userId, session } = await getOrCreateUserId(request);
		const userTodos = await fetchUserTodos(userId);
		return createResponseWithSession(userTodos, session);
	} catch (error) {
		console.error("Error fetching todos:", error);
		return Response.json({ error: "Failed to fetch todos" }, { status: 500 });
	}
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const { userId, session } = await getOrCreateUserId(request);

		switch (request.method) {
			case "POST": {
				const body = (await request.json()) as TodoInsert;
				const newTodo = await createTodo(body, userId);
				return createResponseWithSession(newTodo, session);
			}

			case "PUT": {
				const body = (await request.json()) as TodoInsert & { id: number };
				const updatedTodo = await updateTodo(body, userId);

				if (!updatedTodo) {
					return Response.json({ error: "Todo not found" }, { status: 404 });
				}

				return createResponseWithSession(updatedTodo, session);
			}

			case "DELETE": {
				const url = new URL(request.url);
				const id = url.searchParams.get("id");

				if (!id) {
					return Response.json(
						{ error: "Todo ID is required" },
						{ status: 400 },
					);
				}

				const deletedTodo = await deleteTodo(parseInt(id));

				if (!deletedTodo) {
					return Response.json({ error: "Todo not found" }, { status: 404 });
				}

				return createResponseWithSession({ success: true }, session);
			}

			default:
				return Response.json({ error: "Method not allowed" }, { status: 405 });
		}
	} catch (error) {
		console.error("Error in action:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
