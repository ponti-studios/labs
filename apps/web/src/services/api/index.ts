import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
});

// Check that api is up
api
  .get("/status")
  .then(() => console.log("Server up"))
  .catch(() => console.log("Server disconnected"));

export default api;
