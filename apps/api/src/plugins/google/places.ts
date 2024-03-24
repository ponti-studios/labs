import { writeFile } from "fs";
import * as path from "path";
import { google } from "./auth";
import { places_v1 } from "googleapis";

export const { places } = google.places("v1");

export type FormattedPlace = {
  address: string | null;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsId?: string | null;
  phoneNumber?: string | null;
  types: string[];
  websiteUri?: string | null;
};

const formatGooglePlace = (
  googlePlace: places_v1.Schema$GoogleMapsPlacesV1Place,
): FormattedPlace => {
  return {
    address: googlePlace.adrFormatAddress || null,
    name: googlePlace.displayName?.text || "Unknown",
    latitude: googlePlace.location?.latitude,
    longitude: googlePlace.location?.longitude,
    googleMapsId: googlePlace.id,
    phoneNumber: googlePlace.internationalPhoneNumber,
    types: googlePlace.types || [],
    websiteUri: googlePlace.websiteUri,
  };
};

export type PlaceDetails = {
  place: FormattedPlace;
  photos?: PhotoMedia[];
};
export async function getPlaceDetails({
  placeId,
  fields = [
    "adrFormatAddress",
    "displayName",
    "location",
    "id",
    "internationalPhoneNumber",
    "types",
    "websiteUri",
    "photos",
  ],
}: {
  placeId: string;
  fields?: string[];
}): Promise<PlaceDetails> {
  const response = await places.get({
    name: `places/${placeId}`,
    fields: fields.join(","),
  });

  return {
    place: formatGooglePlace(response.data),
  };
}

export const isValidImageUrl = (url: string) => {
  return (
    !!url && typeof url === "string" && url.indexOf("googleusercontent") !== -1
  );
};

export const getPlacePhotos = async ({
  googleMapsId,
  placeId,
  limit,
}: {
  googleMapsId: string;
  limit?: number;
  placeId: string;
}): Promise<PhotoMedia[] | undefined> => {
  const { data } = await places.get({
    name: `places/${googleMapsId}`,
    fields: "photos",
  });

  if (!data) {
    console.error("Error fetching place", { placeId });
    return;
  }

  const { photos } = data;

  if (!photos) {
    console.error("No photos found for place", { placeId });
    return;
  }

  return Promise.all(
    photos.slice(0, limit).map((photo) => getPhotoMedia(photo)),
  );
};

export async function getPhotosMedia({
  photos,
}: {
  photos: places_v1.Schema$GoogleMapsPlacesV1Photo[];
}) {
  return Promise.all(photos.map((photo) => getPhotoMedia(photo)));
}

export type PhotoMedia = {
  blob: places_v1.Schema$GoogleMapsPlacesV1PhotoMedia;
  imageUrl: string | null;
};

export async function getPhotoMedia(
  photo: places_v1.Schema$GoogleMapsPlacesV1Photo,
) {
  const media = await places.photos.getMedia({
    name: `${photo.name}/media`,
    maxHeightPx: 300,
  });

  let imageUrl = media.request.responseURL;

  return {
    blob: media.data,
    imageUrl: isValidImageUrl(imageUrl) ? imageUrl : null,
  };
}

export const downloadPlacePhotBlob = async (blob: Blob, filename: string) => {
  const buffer = await blob.arrayBuffer();
  const bufferData = Buffer.from(buffer);
  const filePath = path.resolve(__dirname, `./public/${filename}.jpg`);

  await new Promise<void>((res, rej) =>
    writeFile(filePath, bufferData, (err) => {
      if (err) {
        console.error("Error writing file", err);
        rej(err);
      }
      res();
    }),
  );
};

export const downloadPlacePhotos = async ({
  googleMapsId,
  placeId,
}: {
  googleMapsId: string;
  placeId: string;
}) => {
  const photos = await getPlacePhotos({
    googleMapsId,
    placeId,
  });

  if (photos) {
    await Promise.all(
      photos.map(async (photo, index) => {
        return (
          photo.blob &&
          downloadPlacePhotBlob(photo.blob as Blob, `${placeId}-${index}`)
        );
      }),
    );
  }
};

export const searchPlaces = async ({
  query,
  center,
  radius,
  fields = [
    "places.displayName",
    "places.location",
    "places.primaryType",
    "places.shortFormattedAddress",
    "places.id",
  ],
}: {
  fields?: PlaceFields;
  query: string;
  center: { latitude: number; longitude: number };
  radius: number;
}) => {
  const response = await places.searchText({
    requestBody: {
      textQuery: query,
      locationBias: {
        circle: {
          radius,
          center,
        },
      },
      maxResultCount: 10,
    },
    fields: fields.join(","),
  });

  return response.data.places || [];
};

type PlaceField =
  | "places.displayName"
  | "places.location"
  | "places.primaryType"
  | "places.shortFormattedAddress"
  | "places.id"
  | "places.googleMapsUri"
  | "places.name"
  | "places.formattedAddress"
  | "places.accessibilityOptions"
  | "places.addressComponents"
  | "places.adrFormatAddress"
  | "places.businessStatus"
  | "places.formattedAddress"
  | "places.iconBackgroundColor"
  | "places.iconMaskBaseUri"
  | "places.plusCode"
  | "places.primaryTypeDisplayName"
  | "places.subDestinations"
  | "places.types"
  | "places.utcOffsetMinutes"
  | "places.viewport";

type PlaceFields = PlaceField[];
