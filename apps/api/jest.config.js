const path = require("path");

module.exports = async () => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    testMatch: [path.resolve(__dirname, "./src/**/*.test.ts")],
    setupFiles: [path.resolve(__dirname, "./src/jest.setup.ts")],
    transform: {
      "^.+\\.(ts|tsx)$": [
        `ts-jest`,
        {
          tsconfig: `tsconfig.json`,
        },
      ],
    },
  };
};
