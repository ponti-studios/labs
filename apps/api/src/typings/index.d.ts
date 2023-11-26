/* eslint-disable */
import { PrismaClient, Token } from "@prisma/client";
import { Session } from "@fastify/secure-session";
import * as FastifyJwt from "@fastify/jwt";

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
    jwt: {
      sign: (payload: SessionToken) => Promise<Token>;
      verify: (token: string) => Promise<SessionToken>;
    };
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
