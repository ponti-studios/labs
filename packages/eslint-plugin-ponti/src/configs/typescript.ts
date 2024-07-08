// import { TEST_GLOBS } from '../constants';
import {
  ESLINT_OVERRIDES,
  TYPESCRIPT_ESLINT_OVERRIDES,
} from '../plugin-overrides';
import { NO_SHADOW_FIX, RULE_BAN_TYPES } from '../rule-configurations';

export const TYPESCRIPT = {
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  extends: ['xo-typescript/space', 'plugin:unicorn/recommended'],
  rules: {
    ...ESLINT_OVERRIDES,
    ...TYPESCRIPT_ESLINT_OVERRIDES,

    // ─────────────────────────────────────────────────────────────────

    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-useless-undefined': 'off', // @reason: sorta conflicts with a preference for undefined over null
    'unicorn/no-null': 'off', // @reason: sorta conflicts with a preference for undefined over null
    'unicorn/no-array-callback-reference': 'off', // @reason: we want to promote point-free style / tacit style
    'unicorn/prefer-logical-operator-over-ternary': 'off', // @reason: ternaries are useful
    'unicorn/prefer-module': 'off',

    // The autofix here is a problem
    'unicorn/no-nested-ternary': 'off',
    'no-nested-ternary': 'error',

    // ─────────────────────────────────────────────────────────────

    'react/react-in-jsx-scope': 'off',

    // ────────────────────────────────────────────────────────────────────────────────

    // https://stackoverflow.com/a/64745652/1680488
    ...NO_SHADOW_FIX,

    // Reset an XO/TS rule that was a little over-prescriptive
    ...RULE_BAN_TYPES,

    // ...NO_EXTRANEOUS_DEPENDENCIES,

    // // Custom list of props to avoid
    // ...FORBID_COMPONENT_PROPS,
  },
  // overrides: [
  //   {
  //     files: [TEST_GLOBS],
  //     rules: {
  //       'unicorn/no-array-for-each': 'off',
  //       '@typescript-eslint/no-unsafe-member-access': 'off', // review - cross reference TS analogues
  //       '@typescript-eslint/no-empty-function': 'off',
  //       '@typescript-eslint/no-unsafe-return': 'off', // TODO: Review this
  //       '@typescript-eslint/restrict-template-expressions': 'off',
  //       '@typescript-eslint/prefer-nullish-coalescing': 'off',
  //       '@typescript-eslint/no-unsafe-argument': 'off',
  //       '@typescript-eslint/no-var-requires': 'off',
  //     },
  //   },
  // ],
};
