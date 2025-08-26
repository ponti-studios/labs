import axios from "axios";

export const BASE_URL = "https://covid.ponti.io/api";

export interface RegionData {
	confirmed: number;
	county: string;
	deaths: number;
	lastUpdate: number;
	state: string;
	uid: string;
}

export interface BaseData {
	confirmed: number;
	recovered: number;
	deaths: number;
	lastUpdate: string;
}

interface BaseResponse {
	data: {
		confirmed: { value: number };
		recovered: { value: number };
		deaths: { value: number };
		lastUpdate: string;
	};
}

export const fetchData = async (): Promise<BaseData | undefined> => {
	const {
		data: { confirmed, recovered, deaths, lastUpdate },
	}: BaseResponse = await axios.get(BASE_URL);

	return {
		confirmed: confirmed.value,
		recovered: recovered.value,
		deaths: deaths.value,
		lastUpdate,
	};
};

export const fetchCountryData = async (
	countryCode: string,
): Promise<BaseData | undefined> => {
	const { data }: BaseResponse = await axios.get(
		`${BASE_URL}/countries/${countryCode}`,
	);
	const { confirmed, lastUpdate, deaths, recovered } = data;
	return {
		confirmed: confirmed.value,
		deaths: deaths.value,
		lastUpdate,
		recovered: recovered.value,
	};
};

export interface CountryData {
	name: string;
	iso3: string;
}

interface RegionDataResponse {
	admin2: string;
	confirmed: number;
	deaths: number;
	lastUpdate: number;
	provinceState: string;
	uid: string;
}

const MAX_REGION_DATA_RECORDS = 10;

export const fetchCountryRegionalData = async (
	countryCode: string,
	by = "confirmed",
): Promise<RegionData[] | undefined> => {
	const { data }: { data: RegionDataResponse[] } = await axios.get(
		`${BASE_URL}/countries/${countryCode}/${by}`,
	);

	return data
		.splice(0, MAX_REGION_DATA_RECORDS)
		.map(
			({
				admin2: county,
				confirmed,
				deaths,
				lastUpdate,
				provinceState: state,
				uid,
			}) => ({
				confirmed,
				county,
				deaths,
				lastUpdate,
				state,
				uid,
			}),
		);
};
