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
import migrateLatLngFloat from "./crons/migrateLatLngFloat";

// Cron jobs
// import addPhotoToPlaces from "./crons/addPhotoToPlaces";

const listsPlugin: FastifyPluginAsync = async (server) => {
  acceptListInviteRoute(server);
  deleteListRoute(server);
  getListRoute(server);
  getListInvitesRoute(server);
  getListsRoute(server);
  postListRoute(server);
  postListsPlace(server);
  putListRoute(server);

  // Cron jobs
  if (process.env.NODE_ENV !== "test") {
    // addPhotoToPlaces(server).catch((err) => {
    //   console.error("Error adding photo to place", err);
    // });
    migrateLatLngFloat(server).catch((err) => {
      console.error("Error migrating lat and lng", err);
    });
  }
};

export default fastifyPlugin(listsPlugin);
