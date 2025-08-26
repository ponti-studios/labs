// Types for COVID data from the database API
export interface CovidDataRecord {
	id: number;
	isoCode: string | null;
	continent: string | null;
	location: string | null;
	date: string | null;
	totalCases: number | null;
	newCases: number | null;
	newCasesSmoothed: number | null;
	totalDeaths: number | null;
	newDeaths: number | null;
	newDeathsSmoothed: number | null;
	totalCasesPerMillion: number | null;
	newCasesPerMillion: number | null;
	newCasesSmoothedPerMillion: number | null;
	totalDeathsPerMillion: number | null;
	newDeathsPerMillion: number | null;
	newDeathsSmoothedPerMillion: number | null;
	reproductionRate: number | null;
	icuPatients: number | null;
	icuPatientsPerMillion: number | null;
	hospPatients: number | null;
	hospPatientsPerMillion: number | null;
	weeklyIcuAdmissions: number | null;
	weeklyIcuAdmissionsPerMillion: number | null;
	weeklyHospAdmissions: number | null;
	weeklyHospAdmissionsPerMillion: number | null;
	totalTests: number | null;
	newTests: number | null;
	totalTestsPerThousand: number | null;
	newTestsPerThousand: number | null;
	newTestsSmoothed: number | null;
	newTestsSmoothedPerThousand: number | null;
	positiveRate: number | null;
	testsPerCase: number | null;
	testsUnits: string | null;
	totalVaccinations: number | null;
	peopleVaccinated: number | null;
	peopleFullyVaccinated: number | null;
	totalBoosters: number | null;
	newVaccinations: number | null;
	newVaccinationsSmoothed: number | null;
	totalVaccinationsPerHundred: number | null;
	peopleVaccinatedPerHundred: number | null;
	peopleFullyVaccinatedPerHundred: number | null;
	totalBoostersPerHundred: number | null;
	newVaccinationsSmoothedPerMillion: number | null;
	newPeopleVaccinatedSmoothed: number | null;
	newPeopleVaccinatedSmoothedPerHundred: number | null;
	vaccinationDataDate?: string | null;
	stringencyIndex: number | null;
	populationDensity: number | null;
	medianAge: number | null;
	aged65Older: number | null;
	aged70Older: number | null;
	gdpPerCapita: number | null;
	extremePoverty: number | null;
	cardiovascDeathRate: number | null;
	diabetesPrevalence: number | null;
	femaleSmokers: number | null;
	maleSmokers: number | null;
	handwashingFacilities: number | null;
	hospitalBedsPerThousand: number | null;
	lifeExpectancy: number | null;
	humanDevelopmentIndex: number | null;
	population: number | null;
	excessMortalityCumulativeAbsolute: number | null;
	excessMortalityCumulative: number | null;
	excessMortality: number | null;
	excessMortalityCumulativePerMillion: number | null;
}

export interface CovidApiResponse {
	data: CovidDataRecord[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
	filters: {
		country: string | null;
		startDate: string | null;
		endDate: string | null;
	};
}

export interface CountryResponse {
	data: Array<{
		name: string;
		code: string;
	}>;
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}
