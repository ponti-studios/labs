export interface TflCamera {
  id: string;
  available: string;
  commonName: string;
  videoUrl: string;
  view: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

interface TflAdditionalProperty {
  key: string;
  value: string;
}

interface TflPlace {
  id: string;
  commonName: string;
  lat: number;
  lon: number;
  additionalProperties?: TflAdditionalProperty[];
}

function getProperty(properties: TflAdditionalProperty[] | undefined, key: string): string {
  return properties?.find((property) => property.key === key)?.value ?? "";
}

export async function getTflCameras(): Promise<TflCamera[]> {
  try {
    const response = await fetch("https://api.tfl.gov.uk/Place/Type/JamCam");
    if (!response.ok) {
      throw new Error(`TfL camera request failed with ${response.status}`);
    }

    const places = (await response.json()) as TflPlace[];

    return places.map((place) => ({
      id: place.id,
      commonName: place.commonName,
      available: getProperty(place.additionalProperties, "available") || "false",
      imageUrl: getProperty(place.additionalProperties, "imageUrl"),
      videoUrl: getProperty(place.additionalProperties, "videoUrl"),
      view: getProperty(place.additionalProperties, "view"),
      lat: place.lat,
      lng: place.lon,
    }));
  } catch (error) {
    console.error("[tflService] Failed to load TfL cameras:", error);
    return [];
  }
}
