export type { CovidData, NewCovidData } from "./schema/covid";
export type {
  NewSearchDocument,
  SearchDocument,
  SearchDocumentKind,
} from "./schema/search";
export type {
  NewRhobhDailyPuzzle,
  PuzzleAnswerType,
  PuzzleSource,
  RhobhDailyPuzzle,
} from "./schema/puzzles";
export type { NewTflCamera, TflCamera } from "./schema/tfl";
export type {
  CaseUpdate,
  NewCaseUpdate,
  NewRelationshipCase,
  NewRelationshipVerdict,
  RelationshipCase,
  RelationshipVerdict,
} from "./schema/relationship-cases";

export {
  caseUpdates,
  covidData,
  searchDocuments,
  relationshipCases,
  relationshipVerdicts,
  rhobhDailyPuzzles,
  tflCameras,
} from "./schema";

export * from "drizzle-orm";
export { closeDb, db } from "./drizzle";
export * from "./env";
export { appendSearchCorpus, populateCovidData, populateSearchCorpus, populateTflCameras } from "./loaders";
