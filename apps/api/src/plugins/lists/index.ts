import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

// Routes
import getListRoute from "./get/list";
import getListsRoute from "./get";
import postListsPlace from "./post/place";
import postListRoute from "./post";
import putListRoute from "./put";
import deleteListRoute from "./delete";

// Example router with queries that can only be hit if the user requesting is signed in
const listsPlugin: FastifyPluginAsync = async (server) => {
  deleteListRoute(server);
  getListRoute(server);
  getListsRoute(server);
  postListRoute(server);
  postListsPlace(server);
  putListRoute(server);
};

export default fastifyPlugin(listsPlugin);
