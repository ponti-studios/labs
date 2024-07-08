export const TYPESCRIPT_ESLINT_OVERRIDES = {
  // ─────────────────────────────────────────────────────────────────────
  // ──── ENABLE ─────────────────────────────────────────────────────────
  '@typescript-eslint/space-infix-ops': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/object-curly-spacing': ['error', 'always'],

  '@typescript-eslint/quotes': [
    'error',
    'single',
    { avoidEscape: true, allowTemplateLiterals: true }, // need this otherwise prettier will complain
  ],

  // ─────────────────────────────────────────────────────────────────────
  // ──── DISABLE ────────────────────────────────────────────────────────
  '@typescript-eslint/no-use-before-define': 'off', // @reason: ES Modules alleviate hoisting risks, and babel will correct. React Native convention to have styles defined underneath component
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/indent': 'off',
  '@typescript-eslint/comma-dangle': 'off', // There's some weirdness with this rule and prettier, specifically w/ certain TS generics. It's not working as expected.

  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/no-explicit-any': 'off',

  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off', // review
  '@typescript-eslint/naming-convention': 'off',
  '@typescript-eslint/no-duplicate-type-constituents': 'off',
  '@typescript-eslint/no-unsafe-enum-comparison': 'off',

  // ─────────────────────────────────────────────────────────────────────

  '@typescript-eslint/array-type': 'off', // this is conflicting with some other TS Rule w/ auto-fix and breaking types
};
