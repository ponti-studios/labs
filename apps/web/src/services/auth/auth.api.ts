import { AxiosResponse } from "axios";
import { LANDING_PATH } from "../../constants/routes";
import api from "../api";
import { User } from "./auth.types";

export interface LoginPayload {
  email: string;
  emailToken: string;
}

export function getUser(): Promise<AxiosResponse<User>> {
  return api.get("/me");
}

export function authenticate({ email, emailToken }: LoginPayload) {
  return api.post("/authenticate", { email, emailToken });
}

export function logout() {
  return api.post("/logout", {});
}
