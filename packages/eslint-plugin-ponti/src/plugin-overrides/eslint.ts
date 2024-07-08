export const ESLINT_OVERRIDES = {
  'new-cap': 'off', // @reason: this was causing a lot of annoying auto-fixing for comments
  'capitalized-comments': ['off'], // @REASON: Sometimes ya don't want to capitalize, and definitely not into the random autocorrect diff.
  'no-negated-condition': 'off',
  'operator-linebreak': 'off',
  'object-curly-spacing': 'off',
  'global-require': 'off', // @REVIEW: We actually might want global requires to be the default, and then disable it for specific files.
  'no-template-curly-in-string': ['off'], // @REASON: This is used for FormatJS translations

  // 'no-console': ['error'], // @REASON: probably want to use a logger, can be disabled at the project-level if not. This is a performance issue in RN (use logger instead)

  // This allows for single-line `if (cond) return` statements
  curly: [
    'error',
    'multi-line', // Allows the omission of curly braces when all branches of the control statement (like if, else, etc.) are in a single line
    'consistent', // This option requires that if and else blocks be either both with or both without braces
  ],
};
