import { List, ListInvite, User } from "@hominem/db";
import { DefaultSession } from "next-auth";

type ListInviteResponse = ListInvite & { list: List; user: User };

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
    } & DefaultSession["user"];
  }
}
