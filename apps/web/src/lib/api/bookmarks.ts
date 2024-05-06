import { useMutation, useQuery } from "@tanstack/react-query";
import { Axios, type AxiosError } from "axios";
import type { Recommendation } from "../types";
import { api } from "./base";

export const useGetBookmarks = () => {
	return useQuery<Recommendation[]>({
		queryKey: ["bookmarks"],
		queryFn: async () => {
			const res = await fetch("/api/bookmarks");
			return res.json();
		},
	});
};

export const useDeleteBookmark = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/bookmarks/${id}`, {
				method: "DELETE",
			});
			return res.json();
		},
	});
};

export const useCreateBookmark = () => {
	return useMutation<any, AxiosError, string>({
		mutationFn: async (url: string) => {
			const response = await api.post("/bookmarks", {
				method: "POST",
				body: JSON.stringify({ url }),
			});
			return response.data;
		},
	});
};
