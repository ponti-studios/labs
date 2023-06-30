module.exports = {
  env: {
    browser: true,
    node: true,
    jest: false,
  },
  extends: ["eslint:recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "react"],
};
