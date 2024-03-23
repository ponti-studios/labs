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

export type ListPlace = {
  id: string;
  imageUrl: string;
  itemId: string;
  name: string;
  googleMapsId: string;
  types: string[];
  description: string;
};

export type Place = {
  id: string;
  address: string;
  imageUrl: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  name: string;
  photos: string[];
  googleMapsId: string;
  price_level: number;
  rating: number;
  types: string[];
  websiteUri: string;
};

export type PlaceLocation = {
  latitude: number;
  longitude: number;
};
