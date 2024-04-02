const path = require("node:path");
const { pathsToModuleNameMapper } = require("ts-jest");
const { defaults } = require("jest-config");

module.exports = async () => {
	return {
		preset: "ts-jest",
		testEnvironment: "node",
		verbose: true,
		testMatch: [path.resolve(__dirname, "./src/**/*.test.ts")],
		setupFiles: [path.resolve(__dirname, "./test/jest.setup.ts")],
		moduleFileExtensions: [...defaults.moduleFileExtensions],
		moduleNameMapper: pathsToModuleNameMapper(
			{
				"@app/*": ["src/*"],
				"@test/*": ["test/*"],
			},
			{
				prefix: "<rootDir>/",
			},
		),
		transform: {
			"^.+\\.(ts|tsx)$": [
				"ts-jest",
				{
					tsconfig: "tsconfig.json",
				},
			],
		},
	};
};
