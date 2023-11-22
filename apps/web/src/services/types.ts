import { User } from "./auth";

interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea extends BaseModel {
  description: string;
}

export interface List extends BaseModel {
  name: string;
  description: string;
  userId: string;
}

export interface ListInvite extends BaseModel {
  invitedUserEmail: string;
  listId: string;
  accepted: boolean;
  list: List;
  user: User;
}

export interface Recommendation extends BaseModel {
  image: string;
  title: string;
  siteName: string;
  url: string;
}

export type UserList = BaseModel &
  List & {
    listId: string;
    createdBy: User;
  };
