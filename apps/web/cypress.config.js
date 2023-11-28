const { defineConfig } = require("cypress"); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = defineConfig({
  fileServerFolder: "build",
  fixturesFolder: false,
  e2e: {
    // eslint-disable-next-line
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  projectId: process.env.CYPRESS_PROJECT_ID,
});
