module.exports = {
  env: {
    browser: true,
    node: true,
    jest: false,
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react", "prettier"],
  rules: {
    "import/extensions": 0,
    "react/jsx-filename-extension": 0,
    "react/react-in-jsx-scope": 0,
  },
};
