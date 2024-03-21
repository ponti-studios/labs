import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { prisma } from "@hominem/db";

const prismaPlugin: FastifyPluginAsync = async (server) => {
  await prisma.$connect();

  server.addHook("onClose", async (server) => {
    server.log.info("disconnecting Prisma from DB");
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
