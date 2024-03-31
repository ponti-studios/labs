import * as auth from "../src/plugins/auth";

function mockPrismaModel() {
  return {
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };
}

jest.mock("@hominem/db", () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    ...["list", "listInvite", "userLists", "place", "user", "item"].reduce(
      (acc, model) => {
        return { ...acc, [model]: mockPrismaModel() };
      },
      {},
    ),
  },
}));

jest.mock("../src/analytics", () => ({
  track: jest.fn(),
  EVENTS: {
    USER_EVENTS: {},
  },
}));

export const googlePlaces = {
  get: jest.fn(),
  photos: {
    getMedia: jest.fn(),
  },
  searchText: jest.fn(),
};

jest.mock("googleapis", () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn(),
    },
    options: jest.fn(),
    places: jest.fn(() => ({ places: googlePlaces })),
  },
}));

jest.spyOn(auth, "verifySession");
