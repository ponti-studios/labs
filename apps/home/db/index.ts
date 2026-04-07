// Re-export playground tables from @pontistudios/db for backward compatibility
// The home app uses the same covid_data and tfl_cameras tables as playground
export {
	getDb,
	type PlaygroundCovidData,
	type NewPlaygroundCovidData,
	type PlaygroundTflCamera,
	type NewPlaygroundTflCamera,
} from "@pontistudios/db";
