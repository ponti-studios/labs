import { type List, type User, prisma } from "@hominem/db";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { verifySession } from "../auth";

type UserList = {
	list: List & { createdBy: User };
};

async function getUserLists(userId: string) {
	return prisma.userLists.findMany({
		include: {
			list: {
				include: {
					createdBy: true,
				},
			},
		},
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
}

type GetListsResponse = (List & { createdBy: { email: string } })[];
const getListsRoute = (server: FastifyInstance) => {
	server.get(
		"/lists",
		{
			preValidation: verifySession,
		},
		async (request): Promise<GetListsResponse> => {
			const { userId } = request.session.get("data");
			const lists = await prisma.list.findMany({
				include: {
					createdBy: {
						select: { email: true },
					},
				},
				where: { userId },
				orderBy: { createdAt: "desc" },
			});
			const userLists = await getUserLists(userId);

			return [
				...lists,
				...userLists.map(({ list }: UserList) => ({
					...list,
					createdBy: {
						email: list.createdBy.email,
					},
				})),
			];
		},
	);
};

export default getListsRoute;
