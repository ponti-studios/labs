import { getWhatUser, loginUrl, type WhatUser } from "../../server/auth";

export type HominemUser = WhatUser;
export const getHominemUser = getWhatUser;
export function buildHominemLoginUrl(returnTo: string) {
  return loginUrl(new Request(returnTo), returnTo);
}
