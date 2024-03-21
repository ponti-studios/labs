import { prisma } from "../index";

export function getUserAccount(userId: string) {
  return prisma.account.findMany({ where: { userId } });
}
