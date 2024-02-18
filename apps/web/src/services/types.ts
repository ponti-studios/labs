import { User } from "./auth";

interface BaseModel {
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea extends BaseModel {
  id: string;
  description: string;
}

export interface List extends BaseModel {
  id: string;
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
  id: string;
  image: string;
  title: string;
  siteName: string;
  url: string;
}

export type UserList = List & {
  listId: string;
  createdBy: User;
};

export type Place = {
  address: string;
  imageUrl: string;
  international_phone_number: string;
  latitude: number;
  longitude: number;
  name: string;
  photos: string[];
  place_id: string;
  price_level: number;
  rating: number;
  types: string[];
  website: string;
};
