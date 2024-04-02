import api from "../api";

export interface LoginPayload {
	email: string;
	emailToken: string;
}

export function authenticate({ email, emailToken }: LoginPayload) {
	return api.post("/authenticate", { email, emailToken });
}

export function logout() {
	return api.post("/logout", {});
}
