import { FastifyReply, FastifyRequest } from "fastify";
import * as auth from "../src/plugins/auth";

export function mockAuthSession() {
  (auth.verifySession as jest.Mock).mockImplementation(async (req) => {
    req.session.set("data", { userId: "testUserId" });
    return;
  });
}

export function getMockRequest(session: any = {}): FastifyRequest {
  return {
    session,
  } as any as FastifyRequest;
}

export function getMockReply(): FastifyReply {
  return {
    code: jest.fn(),
    send: jest.fn(),
    log: {
      error: jest.fn(),
    },
  } as any as FastifyReply;
}
