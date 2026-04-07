#!/usr/bin/env node
// cars.ts
// CLI to fetch car listings by make and model from CarGurus
import fetch from "node-fetch";
import yargs from "yargs";

const argv = yargs
  .option("make", { type: "string", demandOption: true, describe: "Car make (e.g. Porsche)" })
  .option("model", { type: "string", demandOption: true, describe: "Car model (e.g. Taycan)" })
  .help()
  .argv as any;

async function getMakeId(make: string): Promise<string | null> {
  const res = await fetch("https://www.cargurus.com/api/vehicle-discovery-service/v1/makes?searchType=USED&locale=en_US");
  const data = await res.json();
  const found = data.makes?.find((m: any) => m.name.toLowerCase() === make.toLowerCase());
  return found ? found.id : null;
}

async function getModelId(makeId: string, model: string): Promise<string | null> {
  const res = await fetch(`https://www.cargurus.com/api/vehicle-discovery-service/v1/makes/${makeId}/models?searchType=USED&locale=en_US`);
  const data = await res.json();
  const found = data.models?.find((m: any) => m.name.toLowerCase() === model.toLowerCase());
  return found ? found.id : null;
}

async function getListings(modelId: string) {
  // This is a simplified example. CarGurus API may require more params or cookies for real data.
  const url = `https://www.cargurus.com/Cars/searchPage.action?makeModelTrimPaths=m${modelId}&distance=50&zip=90065&searchType=USED&locale=en_US`;
  const res = await fetch(url);
  const text = await res.text();
  // For demo: just print the first 500 chars of HTML
  console.log(text.slice(0, 500));
}

(async () => {
  const makeId = await getMakeId(argv.make);
  if (!makeId) {
    console.error(`Make not found: ${argv.make}`);
    process.exit(1);
  }
  const modelId = await getModelId(makeId, argv.model);
  if (!modelId) {
    console.error(`Model not found: ${argv.model}`);
    process.exit(1);
  }
  await getListings(modelId);
})();

// fetch("https://www.cargurus.com/api/vehicle-discovery-service/v1/makes?searchType=USED&locale=en_US", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "baggage": "sentry-environment=PROD,sentry-release=site-homepage-574,sentry-public_key=714a683475800f6c527f8922cb6b8db9,sentry-trace_id=cd0ea873334c4e1b9e4cdbf25608688d,sentry-sample_rate=0.1,sentry-sampled=false",
//     "priority": "u=1, i",
//     "sec-ch-device-memory": "8",
//     "sec-ch-ua": "\"Chromium\";v=\"135\", \"Not-A.Brand\";v=\"8\"",
//     "sec-ch-ua-arch": "\"arm\"",
//     "sec-ch-ua-full-version-list": "\"Chromium\";v=\"135.0.7049.116\", \"Not-A.Brand\";v=\"8.0.0.0\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-model": "\"\"",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "sentry-trace": "cd0ea873334c4e1b9e4cdbf25608688d-883bdbba15019e9f-0",
//     "cookie": "CarGurusUserT=3gnQ-76.93.39.108.1741987125393; OTGPPConsent=DBABLA~BVQVAAAABgA.QA; CGSC=1741987141.598.5347.991547|cede558290b18df1205c443781ccaf5a; preferredContactInfo=Y2l0eT1Mb3MgQW5nZWxlcypwb3N0YWxDb2RlPTkwMDY1KnN0YXRlPUNBKmNvdW50cnk9VVMqaG9tZVBvc3RhbENvZGU9OTAwNjUq; usprivacy=1YNN; mySavedListings=%7B%22id%22%3A%22c729f4c5-3662-48f4-b9b3-3c862e05518f%22%7D; LPVID=VlMzUyNThiMjZiYmY2OTIy; SURVEY_SHOWN=April_2017_TV; pastListingSearches=\"{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d299@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d3372@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d309@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d2274@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d2132@,@y1@:2023,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@m112@,@y1@:2023,@z@:@90065@,@l@:@en@}/\"; JSESSIONID=952CA72293FB14C58560DBC782E50E38; cg-ssid=666a76f4c8908410d91e2deadf0a38a97054685d374d6bc6381d0fb352eed205; LPSID-61801890=00egOemtS0KZFQyiLicjBw; baseZip_asOf=90065_1745710053190; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Apr+26+2025+16%3A27%3A33+GMT-0700+(Pacific+Daylight+Time)&version=202405.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=378f1ae1-4a3d-4d86-93d0-7b43b600243c&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&GPPCookiesCount=1&groups=C0001%3A1%2CC0003%3A1%2CSSPD_BG%3A0%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; datadome=xkBX~R2hbj10cQsmC78gyeABHVhZJJPvsGoMCMuKFCkRV5tljuBrBfrM5kJ5AGruXIpoRW0MwqqdFPDEO0JudkpLmy3NheDSdGweYUYGjQwPb0U8fThZvwNTzeWApLLN; _sp_ses.df9a=*; _sp_id.df9a=af335e8d-e951-4481-a639-d0dabe84ec4d.1741987126.18.1746584090.1746487120.a16bd0ea-e748-475b-914f-f38f19f95e95",
//     "Referer": "https://www.cargurus.com/",
//     "Referrer-Policy": "origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });

// fetch("https://www.cargurus.com/api/vehicle-discovery-service/v1/makes/7/models?searchType=USED&locale=en_US", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "baggage": "sentry-environment=PROD,sentry-release=site-homepage-574,sentry-public_key=714a683475800f6c527f8922cb6b8db9,sentry-trace_id=cd0ea873334c4e1b9e4cdbf25608688d,sentry-sample_rate=0.1,sentry-sampled=false",
//     "priority": "u=1, i",
//     "sec-ch-device-memory": "8",
//     "sec-ch-ua": "\"Chromium\";v=\"135\", \"Not-A.Brand\";v=\"8\"",
//     "sec-ch-ua-arch": "\"arm\"",
//     "sec-ch-ua-full-version-list": "\"Chromium\";v=\"135.0.7049.116\", \"Not-A.Brand\";v=\"8.0.0.0\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-model": "\"\"",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "sentry-trace": "cd0ea873334c4e1b9e4cdbf25608688d-b80117ad2fe3c1e8-0",
//     "cookie": "CarGurusUserT=3gnQ-76.93.39.108.1741987125393; OTGPPConsent=DBABLA~BVQVAAAABgA.QA; CGSC=1741987141.598.5347.991547|cede558290b18df1205c443781ccaf5a; preferredContactInfo=Y2l0eT1Mb3MgQW5nZWxlcypwb3N0YWxDb2RlPTkwMDY1KnN0YXRlPUNBKmNvdW50cnk9VVMqaG9tZVBvc3RhbENvZGU9OTAwNjUq; usprivacy=1YNN; mySavedListings=%7B%22id%22%3A%22c729f4c5-3662-48f4-b9b3-3c862e05518f%22%7D; LPVID=VlMzUyNThiMjZiYmY2OTIy; SURVEY_SHOWN=April_2017_TV; pastListingSearches=\"{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d299@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d3372@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d309@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d2274@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@d2132@,@y1@:2023,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1745640000000,@e@:@m112@,@y1@:2023,@z@:@90065@,@l@:@en@}/\"; JSESSIONID=952CA72293FB14C58560DBC782E50E38; cg-ssid=666a76f4c8908410d91e2deadf0a38a97054685d374d6bc6381d0fb352eed205; LPSID-61801890=00egOemtS0KZFQyiLicjBw; baseZip_asOf=90065_1745710053190; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Apr+26+2025+16%3A27%3A33+GMT-0700+(Pacific+Daylight+Time)&version=202405.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=378f1ae1-4a3d-4d86-93d0-7b43b600243c&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&GPPCookiesCount=1&groups=C0001%3A1%2CC0003%3A1%2CSSPD_BG%3A0%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; datadome=xkBX~R2hbj10cQsmC78gyeABHVhZJJPvsGoMCMuKFCkRV5tljuBrBfrM5kJ5AGruXIpoRW0MwqqdFPDEO0JudkpLmy3NheDSdGweYUYGjQwPb0U8fThZvwNTzeWApLLN; _sp_ses.df9a=*; _sp_id.df9a=af335e8d-e951-4481-a639-d0dabe84ec4d.1741987126.18.1746584090.1746487120.a16bd0ea-e748-475b-914f-f38f19f95e95",
//     "Referer": "https://www.cargurus.com/",
//     "Referrer-Policy": "origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });

// fetch("https://www.cargurus.com/Cars/searchPage.action?searchId=f503dbcf-217e-470b-93d7-6791446d5fc7&zip=90065&distance=50&entitySelectingHelper.selectedEntity=m48&sourceContext=carGurusHomePageModel&sortDir=ASC&sortType=BEST_MATCH&makeModelTrimPaths=m48&srpVariation=DEFAULT_SEARCH&isDeliveryEnabled=true&nonShippableBaseline=1270&pageReceipt=eyJwYWdlQWxpZ25tZW50IjpbMTgsMjFdLCJzZWVuU3BvbnNvcmVkTGlzdGluZ0lkcyI6WzQxNDYwODc1Niw0MDY5NDIxNDYsNDA4MjE5MTY1LDQxNTc3Mzg3OV19&pageNumber=2&filtersModified=true", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "priority": "u=1, i",
//     "sec-ch-device-memory": "8",
//     "sec-ch-ua": "\"Chromium\";v=\"135\", \"Not-A.Brand\";v=\"8\"",
//     "sec-ch-ua-arch": "\"arm\"",
//     "sec-ch-ua-full-version-list": "\"Chromium\";v=\"135.0.7049.116\", \"Not-A.Brand\";v=\"8.0.0.0\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-model": "\"\"",
//     "sec-ch-ua-platform": "\"macOS\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "cookie": "CarGurusUserT=3gnQ-76.93.39.108.1741987125393; CGSC=1741987141.598.5347.991547|cede558290b18df1205c443781ccaf5a; preferredContactInfo=Y2l0eT1Mb3MgQW5nZWxlcypwb3N0YWxDb2RlPTkwMDY1KnN0YXRlPUNBKmNvdW50cnk9VVMqaG9tZVBvc3RhbENvZGU9OTAwNjUq; usprivacy=1YNN; mySavedListings=%7B%22id%22%3A%22c729f4c5-3662-48f4-b9b3-3c862e05518f%22%7D; LPVID=VlMzUyNThiMjZiYmY2OTIy; SURVEY_SHOWN=April_2017_TV; JSESSIONID=952CA72293FB14C58560DBC782E50E38; cg-ssid=666a76f4c8908410d91e2deadf0a38a97054685d374d6bc6381d0fb352eed205; LPSID-61801890=00egOemtS0KZFQyiLicjBw; _sp_ses.df9a=*; pastListingSearches=\"{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@m48@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@d299@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@d3372@,@y1@:2024,@y2@:2026,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@d309@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@d2274@,@z@:@90065@,@l@:@en@}/{@s@:@USED@,@d@:50,@t@:1746504000000,@e@:@d2132@,@y1@:2023,@z@:@90065@,@l@:@en@}/\"; baseZip_asOf=90065_1746584276591; datadome=~VSY_F~E1_76I0dy_1XRp6T8R~sdaqNvLNIFM8e1jMcdqIIp_K6gNZ6b0Cr8dPghuGCnicybbzNYmjg2_Qm6Sgu6~6oUKpSwoqB8cYNziMFj3aWTyS53sPmjUgwxNeNT; OptanonConsent=isGpcEnabled=0&datestamp=Tue+May+06+2025+19%3A17%3A57+GMT-0700+(Pacific+Daylight+Time)&version=202503.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=378f1ae1-4a3d-4d86-93d0-7b43b600243c&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&GPPCookiesCount=1&groups=C0001%3A1%2CC0003%3A1%2CSSPD_BG%3A0%2CC0002%3A0%2CC0004%3A0&AwaitingReconsent=false; OTGPPConsent=DBABLA~BVQVAAAAAAGA.QA; _sp_id.df9a=af335e8d-e951-4481-a639-d0dabe84ec4d.1741987126.18.1746584303.1746487120.a16bd0ea-e748-475b-914f-f38f19f95e95",
//     "Referer": "https://www.cargurus.com/Cars/inventorylisting/viewDetailsFilterViewInventoryListing.action?sourceContext=carGurusHomePageModel&entitySelectingHelper.selectedEntity=m48&zip=90065",
//     "Referrer-Policy": "origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });