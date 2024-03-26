import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
