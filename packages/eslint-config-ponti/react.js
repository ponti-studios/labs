module.exports = {
  env: {
    browser: true,
    node: true,
    jest: false,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "unused-imports",
    "simple-import-sort",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error"],
    "import/extensions": 0,
    "react/jsx-filename-extension": 0,
    "react/react-in-jsx-scope": 0,
  },
};
