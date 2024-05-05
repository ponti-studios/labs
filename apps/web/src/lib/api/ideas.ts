import { useMutation, useQuery } from "react-query";

export const useGetIdeas = () => {
	return useQuery("ideas", async () => {
		const res = await fetch("/api/ideas");
		return res.json();
	});
};

export const useCreateIdea = () => {
	return useMutation({
		mutationFn: async (idea: string) => {
			const res = await fetch("/api/idea", {
				method: "POST",
				body: JSON.stringify(idea),
			});
			return res.json();
		},
	});
};

export const useDeleteIdea = () => {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/idea/${id}`, {
				method: "DELETE",
			});
			return res.json();
		},
	});
};
