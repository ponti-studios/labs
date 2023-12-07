import * as auth from "./plugins/auth";

export function mockAuthSession() {
  (auth.verifySession as jest.Mock).mockImplementation(async (req) => {
    req.session.set("data", { userId: "testUserId" });
    return;
  });
}
