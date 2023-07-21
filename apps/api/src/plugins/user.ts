import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const usersPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  const { prisma } = server;

  server.get(
    "/me",
    {
      preValidation: server.verifySession,
    },
    async (request, reply) => {
      const session = request.session.get("data");
      try {
        const user = await prisma.user.findUnique({
          where: {
            id: session.userId,
          },
        });

        /**
         * If user does not exist, then we should delete their
         * session and return a 401.
         */
        if (!user) {
          request.session.delete();
          return reply.send().code(401);
        }

        return reply.send(user).code(200);
      } catch (err) {
        request.log.info("Could not fetch user", { err });
        return reply.code(500).send();
      }
    }
  );
};

export default fp(usersPlugin);
