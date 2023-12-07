import axios from "axios";
export const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:4444";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const URLS = {
  lists: `${baseURL}/lists`,
};
