import { eq, sql } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { db, projects, todos } from "~/db";
import type { ProjectInsert } from "~/db/schema";
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

// Data handling functions
async function fetchUserProjects(userId: string) {
	return await db
		.select({
			id: projects.id,
			userId: projects.userId,
			name: projects.name,
			description: projects.description,
			createdAt: projects.createdAt,
			updatedAt: projects.updatedAt,
			taskCount: sql<number>`COALESCE(COUNT(${todos.id}), 0)`.as("taskCount"),
		})
		.from(projects)
		.leftJoin(todos, eq(projects.id, todos.projectId))
		.where(eq(projects.userId, userId))
		.groupBy(
			projects.id,
			projects.userId,
			projects.name,
			projects.description,
			projects.createdAt,
			projects.updatedAt,
		)
		.orderBy(projects.createdAt);
}

async function createProject(projectData: ProjectInsert, userId: string) {
	return await db
		.insert(projects)
		.values({
			...projectData,
			userId,
		})
		.returning()
		.then((rows) => rows[0]);
}

async function updateProject(
	projectData: ProjectInsert & { id: number },
	userId: string,
) {
	return await db
		.update(projects)
		.set({
			...projectData,
			userId,
			updatedAt: new Date().toISOString(),
		})
		.where(eq(projects.id, projectData.id))
		.returning()
		.then((rows) => rows[0]);
}

async function deleteProject(projectId: number) {
	return await db
		.delete(projects)
		.where(eq(projects.id, projectId))
		.returning()
		.then((rows) => rows[0]);
}

// Loader function for GET requests
export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const { userId, session } = await getOrCreateUserId(request);
		const userProjects = await fetchUserProjects(userId);
		return createResponseWithSession(userProjects, session);
	} catch (error) {
		console.error("Error fetching projects:", error);
		return Response.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

// Action function for POST, PUT, DELETE requests
export async function action({ request }: ActionFunctionArgs) {
	try {
		const { userId, session } = await getOrCreateUserId(request);

		switch (request.method) {
			case "POST": {
				const body = (await request.json()) as ProjectInsert;
				const newProject = await createProject(body, userId);
				return createResponseWithSession(newProject, session);
			}

			case "PUT": {
				const body = (await request.json()) as ProjectInsert & { id: number };
				const updatedProject = await updateProject(body, userId);

				if (!updatedProject) {
					return Response.json({ error: "Project not found" }, { status: 404 });
				}

				return createResponseWithSession(updatedProject, session);
			}

			case "DELETE": {
				const url = new URL(request.url);
				const id = url.searchParams.get("id");

				if (!id) {
					return Response.json(
						{ error: "Project ID is required" },
						{ status: 400 },
					);
				}

				const deletedProject = await deleteProject(parseInt(id));

				if (!deletedProject) {
					return Response.json({ error: "Project not found" }, { status: 404 });
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
