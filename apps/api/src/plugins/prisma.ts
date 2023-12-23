import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

const prismaPlugin: FastifyPluginAsync = async (server) => {
  await prisma.$connect();

  server.decorate("prisma", prisma);

  server.addHook("onClose", async (server) => {
    server.log.info("disconnecting Prisma from DB");
    await server.prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
