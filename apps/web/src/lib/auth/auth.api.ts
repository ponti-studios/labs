import api from "../api";

export interface LoginPayload {
	email: string;
	emailToken: string;
}

export async function getUser() {
	const response = await api.get("/me");

	if (!response.data || !response.data.id) {
		throw new Error("User not found");
	}

	return response.data;
}

export function authenticate({ email, emailToken }: LoginPayload) {
	return api.post("/authenticate", { email, emailToken });
}

export function logout() {
	return api.post("/logout", {});
}
