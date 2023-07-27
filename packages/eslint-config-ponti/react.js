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
  plugins: [
    "@typescript-eslint",
    "react",
    "prettier",
    "unused-imports",
    "simple-import-sort",
  ],
  rules: {
    "import/extensions": 0,
    "react/jsx-filename-extension": 0,
    "react/react-in-jsx-scope": 0,
    "@typescript-eslint/no-unused-vars": ["error"],
  },
  settings: {
    react: {
      // Regex for Component Factory to use,
      createClass: "createReactClass",
      // default to "createReactClass"
      pragma: "React", // Pragma to use, default to "React"
      fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
      version: "detect", // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // It will default to "latest" and warn if missing, and to "detect" in the future
      flowVersion: "0.53", // Flow version
    },
  },
};
