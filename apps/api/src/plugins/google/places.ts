import { PlacesClient } from "@googlemaps/places";

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

// Instantiates a client
const placesClient = new PlacesClient({
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
});

export default placesClient;

async function getPlaceDetails({
  placeId,
  fields = ["photos", "formatted_address"],
}: {
  placeId: string;
  fields: string[];
}) {
  return new Promise<any>((resolve) => {
    placesClient.getPlace(
      { name: `places/${placeId}` },
      {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": fields.join(","),
          },
        },
        maxResults: 10,
      },
      (err, place) => {
        if (err) {
          console.error("Error fetching place", place);
          return resolve({});
        }

        return resolve(place);
      },
    );
  });
}

async function getPhotoURI({
  name,
  maxHeightPx = 300,
}: {
  name: string;
  maxHeightPx?: number;
}) {
  return new Promise<string>((resolve, reject) => {
    placesClient.getPhotoMedia(
      { name, maxHeightPx },
      {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": "photoUri",
          },
        },
      },
      (err, media) => {
        if (err) {
          console.error("Error fetching place photo", err);
          return reject(err);
        }

        if (!media) {
          console.error("No media found for place photo", media);
          return reject("No media found for place photo");
        }

        if (!media.photoUri) {
          console.error("No photoUri found for place photo", media);
          return reject("No photoUri found for place photo");
        }

        return resolve(media.photoUri);
      },
    );
  });
}

export async function getPlacePhoto(placeId: string) {
  const place = await getPlaceDetails({ placeId, fields: ["photos"] });
  const placePhotoName = place?.photos?.[0]?.name;

  if (!placePhotoName) {
    console.error("No photo found for place", place);
    throw new Error("No photo found for place");
  }

  const photoUri = await getPhotoURI({
    name: `${placePhotoName}/media`,
    maxHeightPx: 300,
  });

  return photoUri;
}
