import { ESLINT_OVERRIDES } from '../plugin-overrides';

export const TESTS = {
  env: {
    jest: true,
    'jest/globals': true,
  },
  extends: ['plugin:jest/recommended', 'plugin:testing-library/react'],

  rules: {
    ...ESLINT_OVERRIDES,

    // ─────────────────────────────────────────────────────────────────

    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'jest/expect-expect': 'off',
    'jest/valid-title': 'off',

    // ─────────────────────────────────────────────────────────────────

    // RNTL compliance - https://github.com/callstack/react-native-testing-library/issues/295#issuecomment-630327005
    'testing-library/no-debug': ['off'],
    'testing-library/prefer-wait-for': ['off'],
    'testing-library/await-async-query': ['off'],
    'testing-library/prefer-screen-queries': ['off'],

    'testing-library/no-unnecessary-act': ['off'],
    'testing-library/prefer-presence-queries': ['off'],
    'testing-library/no-wait-for-side-effects': ['off'],
    'testing-library/no-wait-for-multiple-assertions': ['off'],
  },
};
