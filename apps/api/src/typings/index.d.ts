/* eslint-disable */
import { Token } from "@prisma/client";
import { Session } from "@fastify/secure-session";

interface SessionToken {
  userId: string;
  isAdmin: boolean;
  roles: string[];
}

declare module "fastify" {
  interface FastifyInstance extends FastifyServerFactory {
    getUserId: (FastifyRequest) => string;
    prisma: PrismaClient;
    sendEmailToken: Function;
  }

  interface FastifyRequest
    extends FastifyRequest<RouteGenericInterface, Server, IncomingMessage> {
    auth: {
      userId: string;
      isAdmin: boolean;
    };
    session: Session;
  }
}
