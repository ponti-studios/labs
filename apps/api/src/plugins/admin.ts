import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const adminPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    "/admin/users",
    {
      preValidation: server.verifyIsAdmin,
    },
    async (request, reply) => {
      try {
        const users = await server.prisma.user.findMany();
        reply.send(users).code(200);
      } catch (err) {
        request.log.info("Could not fetch users", err);
        reply.code(500).send();
      }
    }
  );
};

export default fp(adminPlugin);
