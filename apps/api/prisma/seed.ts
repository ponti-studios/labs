import { PrismaClient } from "@prisma/client";

// Instantiate Prisma Client
const prisma = new PrismaClient();

async function main() {
  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});

  await Promise.all([
    prisma.user.create({
      data: {
        email: "grace@hey.com",
        name: "Grace Bell",
      },
    }),
    prisma.user.create({
      data: {
        email: "jeff@f.ff",
        name: "Jeff Homie",
      },
    }),
  ]);
}

main()
  .catch((e: Error) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
