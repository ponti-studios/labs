import { QueryKey, UseQueryOptions, useMutation, useQuery } from "react-query";

import { User } from "../auth";
import { List, ListInvite, UserList } from "../types";
import { api, baseURL } from "./base";

type InboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetInboundInvites = () => {
  return useQuery<InboundInvitesResponse>("inboundInvites", async () => {
    const res = await api.get(`${baseURL}/invites/inbound`);
    return res.data;
  });
};

type OutboundInvitesResponse = (ListInvite & { list: List; user: User })[];
export const useGetOutboundInvites = () => {
  return useQuery<OutboundInvitesResponse>("outboundInvites", async () => {
    const res = await api.get(`${baseURL}/invites/outbound`);
    return res.data;
  });
};

export function useAcceptInviteMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`${baseURL}/invites/${id}/accept`);
      return res.data;
    },
  });
}

type ListInvitesResponse = (ListInvite & { list: List })[];
export const useGetListInvites = (id: string) => {
  return useQuery<ListInvitesResponse>("listInvites", async () => {
    const res = await api.get(`${baseURL}/list/${id}/invites`);
    return res.data;
  });
};

export const useCreateListInvite = () => {
  return useMutation({
    mutationFn: async ({ email, id }: { email: string; id: string }) => {
      const res = await api.post(`${baseURL}/list/${id}/invites`, {
        email,
      });
      return res.data;
    },
  });
};

export const useGetLists = ({
  options,
}: {
  options?: Omit<
    UseQueryOptions<UserList[], { message: string }, UserList[], QueryKey>,
    "queryKey" | "queryFn"
  >;
} = {}) => {
  return useQuery<UserList[], { message: string }>(
    "lists",
    async () => {
      const res = await api.get(`${baseURL}/lists`);
      return res.data;
    },
    options,
  );
};

type GetListResponse = UserList & {
  items: {
    id: string;
    name: string;
    googleMapsId: string;
    types: string[];
  }[];
};
export const useGetList = (id: string) => {
  return useQuery<GetListResponse>(["list", id], async () => {
    const res = await api.get(`${baseURL}/lists/${id}`);
    return res.data;
  });
};

export const useUpdateList = () => {
  return useMutation({
    mutationFn: async (list: List) => {
      const res = await api.put(`${baseURL}/lists/${list.id}`, {
        list,
      });
      return res.data;
    },
  });
};

export const useDeleteList = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`${baseURL}/lists/${id}`);
      return res.data;
    },
  });
};

export default api;
