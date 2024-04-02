import { prisma } from "@hominem/db";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { verifyIsAdmin } from "./auth";

const adminPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/admin/users",
    {
      preValidation: verifyIsAdmin,
    },
    async (request, reply) => {
      try {
        const users = await prisma.user.findMany();
        return reply.code(200).send(users);
      } catch (err) {
        request.log.info("Could not fetch users", err);
        return reply.code(500).send();
      }
    },
  );
};

export default fp(adminPlugin);
