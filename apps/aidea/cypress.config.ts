import { defineConfig } from "cypress";

export default defineConfig({
  fileServerFolder: "build",
  fixturesFolder: false,
  e2e: {
    // eslint-disable-next-line
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:4173/",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
  },
  projectId: process.env.CYPRESS_PROJECT_ID,
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
