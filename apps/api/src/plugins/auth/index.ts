import crypto from "crypto";
import { TokenType } from "@prisma/client";
import { add } from "date-fns";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
  preValidationHookHandler,
} from "fastify";
import fp from "fastify-plugin";
import { APP_USER_ID, EVENTS, track } from "../../analytics";
import { TOKEN_FAILURE_REASONS } from "./constants";
import { prisma } from "../prisma";
import { createToken } from "./createToken";

interface LoginInput {
  email: string;
}

interface AuthenticateInput {
  email: string;
  emailToken: string;
}

const COOKIE_SECRET = process.env.COOKIE_SECRET;
const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 12;

if (!COOKIE_SECRET && process.env.NODE_ENV !== "test") {
  console.log(
    "warn",
    "The COOKIE_SECRET env var is not set. This is unsafe! If running in production, set it.",
  );
  throw Error;
}

const authPlugin: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post(
    "/authenticate",
    {
      schema: {
        body: {
          email: { type: "string" },
          emailToken: { type: "string" },
        },
      },
    },
    async (request, reply) => {
      // 👇 get prisma from shared application state
      const { prisma } = server;
      // 👇 get the email and emailToken from the request payload
      const { email, emailToken } = request.body as AuthenticateInput;

      // Get short lived email token
      const fetchedEmailToken = await prisma.token.findUnique({
        where: {
          emailToken,
        },
        include: {
          user: true,
        },
      });

      if (!fetchedEmailToken) {
        // If the token doesn't exist, return 400 bad request
        reply.log.error("Login token does not exist");
        track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
          reason: TOKEN_FAILURE_REASONS.NOT_FOUND,
        });
        return reply.code(400).send("Invalid token");
      }

      if (!fetchedEmailToken.valid) {
        request.session.delete();
        // If the token doesn't exist or is not valid, return 401 unauthorized
        reply.log.error("Login token is not valid");
        track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
          reason: TOKEN_FAILURE_REASONS.INVALID,
        });
        return reply.code(401).send();
      }

      if (fetchedEmailToken.expiration < new Date()) {
        request.session.delete();
        // If the token has expired, return 401 unauthorized
        reply.log.error("Login token has expired");
        track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
          reason: TOKEN_FAILURE_REASONS.EXPIRED,
        });
        return reply.code(401).send("Token expired");
      }

      if (fetchedEmailToken.user?.email !== email) {
        request.session.delete();
        // If token doesn't match the email passed in the payload, return 401 unauthorized
        reply.log.error("Token email does not match email");
        track(APP_USER_ID, EVENTS.USER_EVENTS.EMAIL_TOKEN_VALIDATED_FAILURE, {
          reason: TOKEN_FAILURE_REASONS.EMAIL_MISMATCH,
        });
        return reply.code(401).send();
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
          },
        });
      }

      const tokenBase = {
        isAdmin: user.isAdmin,
        roles: ["user", !!user.isAdmin && "admin"].filter(Boolean),
        userId: user.id,
      };
      const accessToken = server.jwt.sign(tokenBase);

      // Create a unique refresh token
      const refreshToken = crypto.randomUUID();

      const [createdToken] = await prisma.$transaction([
        prisma.token.create({
          data: {
            type: TokenType.API,
            accessToken,
            refreshToken,
            expiration: add(new Date(), {
              hours: AUTHENTICATION_TOKEN_EXPIRATION_HOURS,
            }),
            user: {
              connect: {
                email,
              },
            },
          },
          include: {
            user: true,
          },
        }),
        // Invalidate the email token after it's been used
        prisma.token.update({
          where: {
            id: fetchedEmailToken.id,
          },
          data: {
            valid: false,
          },
        }),
      ]);

      const { id: userId, isAdmin, name } = createdToken.user;
      const responseUser = {
        ...tokenBase,
        name,
      };

      track(userId, EVENTS.USER_EVENTS.LOGIN_SUCCESS, { isAdmin });

      request.session.set("data", responseUser);

      return reply
        .code(200)
        .send({ user: responseUser })
        .headers({
          Authorization: `Bearer ${accessToken}`,
        });
    },
  );

  server.post("/logout", {}, async (request, reply) => {
    request.session.delete();
    return reply.code(200).send();
  });

  /**
   * Login/Registration handler
   *
   * Because there are no passwords, the same endpoint is used for login and regsitration
   * Generates a short lived verification token and sends an email
   */
  server.post(
    "/login",
    {
      schema: {
        body: {
          email: { type: "string" },
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body as LoginInput;

      try {
        await createToken({ email, server });
        return reply.code(200).send();
      } catch (error) {
        const message = (error as Error)?.message;
        request.log.error(message);
        track(APP_USER_ID, EVENTS.USER_EVENTS.REGISTER_FAILURE, { message });
        return reply.code(500).send({ message: "Could not create account" });
      }
    },
  );

  server.decorate("verifyPermissions", (permissions: string[]) => {
    return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
      const data = request.session.get("data");

      if (!data) {
        return reply.code(401).send();
      }

      if (!data.roles.includes(permissions[0])) {
        return reply.code(403).send();
      }

      return done();
    };
  });
};

export const verifyIsAdmin: preValidationHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const data = request.session.get("data");

  if (!data) {
    reply.log.error("Could not verifyIsAdmin - no session");
    return reply.code(401).send();
  }

  if (!data.isAdmin) {
    return reply.code(403).send();
  }
};

export const verifySession: preValidationHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const data = request.session.get("data");

  /**
   * If no session exists, attempt to verify the JWT token.
   */
  if (!data) {
    let token;

    try {
      token = await request.jwtVerify<{ userId: string }>();
    } catch (e: any) {
      reply.log.error("Could not verify session token", e);
      return reply.code(401).send();
    }

    /**
     * If the token is invalid or doesn't contain a userId,
     * return 401 unauthorized
     */
    if (!token || (token && !token.userId)) {
      return reply.code(401).send();
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: token.userId },
      });

      /**
       * If the user doesn't exist, return 401 unauthorized
       */
      if (!user) {
        return reply.code(401).send();
      }

      request.session.set("data", {
        ...token,
        email: user.email,
      });
    } catch (e: any) {
      reply.log.error("Could not verify session", e);
      return reply.code(401).send();
    }
  }

  /**
   * If the session exists, but the email is missing,
   */
  if (data && data.userId && !data.email) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    request.session.set("data", {
      ...data,
      email: user?.email,
    });
  }
};

export default fp(authPlugin);
