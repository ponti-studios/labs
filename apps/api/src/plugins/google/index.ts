import { google } from "googleapis";
import placesClient, { getPlacePhoto } from "./places";

const { GOOGLE_SERVICE_ACCOUNT } = process.env;

if (!GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT is required");
}

const credential = JSON.parse(
  Buffer.from(GOOGLE_SERVICE_ACCOUNT, "base64").toString(),
) as {
  client_email: string;
  private_key: string;
};

const auth = new google.auth.GoogleAuth({
  credentials: credential,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

google.options({ auth });

const { places } = google.places("v1");

// Helper function get place details from Google Places API
export async function getPlaceDetails({
  placeId,
}: {
  placeId: string;
  fields: string[];
}) {
  const response = await places.get({
    name: `places/${placeId}`,
    fields: "formatted_address,photos",
  });

  return response.data;
}

export { getPlacePhoto, placesClient, places };
