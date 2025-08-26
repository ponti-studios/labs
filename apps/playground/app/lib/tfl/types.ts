export enum PropertyKey {
	available = "available",
	imageUrl = "imageUrl",
	videoUrl = "videoUrl",
	view = "view",
}

export type AdditionalProperty = {
	$type: string;
	category: string;
	key: PropertyKey;
	sourceSystemKey: string;
	value: string;
	modified: string;
};

export type BaseCamera = {
	$type: string;
	id: string;
	url: string;
	commonName: string;
	placeType: "JamCam";
	additionalProperties: AdditionalProperty[];
	children: unknown[];
	childrenUrls: unknown[];
	lat: number;
	lon: number;
};

export interface Camera {
	id: string;
	available?: string;
	commonName: string;
	videoUrl: string;
	view: string;
	imageUrl: string;
	lat: number;
	lng: number;
}

export type Cameras = Camera[];
