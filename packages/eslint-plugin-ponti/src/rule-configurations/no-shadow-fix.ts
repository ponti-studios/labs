// https://stackoverflow.com/a/64745652/1680488
export const NO_SHADOW_FIX = {
  // TS "Extension" Rules
  // https://github.com/typescript-eslint/typescript-eslint/blob/HEAD/docs/getting-started/linting/FAQ.md#i-am-using-a-rule-from-eslint-core-and-it-doesnt-work-correctly-with-typescript-code
  'no-shadow': 'off', // No-shadow throwing errors with enums https://stackoverflow.com/a/63961972
  '@typescript-eslint/no-shadow': ['error'],
};
