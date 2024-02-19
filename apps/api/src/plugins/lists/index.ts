import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";

// Routes
import deleteListRoute from "./delete";
import getListsRoute from "./get";
import getListRoute from "./get/list";
import getListInvitesRoute from "./get/list/invites";
import postListsPlace from "./post/place";
import postListRoute from "./post";
import acceptListInviteRoute from "./post/acceptInvite";
import putListRoute from "./put";
import addPhotoToPlace from "./crons/addPhotoToPlace";

const listsPlugin: FastifyPluginAsync = async (server) => {
  acceptListInviteRoute(server);
  deleteListRoute(server);
  getListRoute(server);
  getListInvitesRoute(server);
  getListsRoute(server);
  postListRoute(server);
  postListsPlace(server);
  putListRoute(server);

  // Add cron jobs
  addPhotoToPlace(server).catch((err) => {
    server.log.error(err);
  });
};

export default fastifyPlugin(listsPlugin);
