// import { TEST_GLOBS } from '../constants';
export const FUNCTIONAL_LITE = {
  plugins: ['functional'],

  rules: {
    // No Mutations Rules
    'functional/immutable-data': [
      'error',
      { ignoreAccessorPattern: '**.defaultProps' },
    ],
    'functional/prefer-property-signatures': ['off'],
    'functional/readonly-type': ['error', 'generic'],
    'functional/type-declaration-immutability': [
      'error',
      {
        rules: [
          {
            identifiers: 'I?Immutable.+',
            immutability: 'Immutable',
            comparator: 'AtLeast',
          },
          {
            identifiers: 'I?ReadonlyDeep.+',
            immutability: 'ReadonlyDeep',
            comparator: 'AtLeast',
          },
          {
            identifiers: 'I?Readonly.+',
            immutability: 'ReadonlyShallow',
            comparator: 'AtLeast',
            fixer: [
              {
                pattern: '^(Array|Map|Set)<(.+)>$',
                replace: 'Readonly$1<$2>',
              },
              {
                pattern: '^(.+)$',
                replace: 'Readonly<$1>',
              },
            ],
          },
          {
            identifiers: 'I?Mutable.+',
            immutability: 'Mutable',
            comparator: 'AtMost',
            fixer: [
              {
                pattern: '^Readonly(Array|Map|Set)<(.+)>$',
                replace: '$1<$2>',
              },
              {
                pattern: '^Readonly<(.+)>$',
                replace: '$1',
              },
            ],
          },
        ],
      },
    ],
    'functional/no-let': ['error', { allowInFunctions: true }],

    // No OO Rules
    // 'functional/no-classes': ['error'], disabled to support NestJS projects
    // 'functional/no-this-expressions': ['error'], disabled to support NestJS projects
    // 'functional/prefer-type-literal': ['error'], // @reason: https://fettblog.eu/tidy-typescript-prefer-type-aliases/
    'functional/no-mixed-types': ['off'],

    // No Statements Rules
    'functional/no-loop-statements': ['error'],
    'functional/no-conditional-statements': ['off'],
    'functional/no-expression-statements': ['off'],
    'functional/no-return-void': ['off', { ignoreInferredTypes: true }],

    // No Exceptions Rules
    'functional/no-promise-reject': ['off'],
    'functional/no-throw-statements': ['off'],
    'functional/no-try-statements': ['off'],

    // Currying Rules
    'functional/functional-parameters': ['off'],

    // Stylistic Rules
    'functional/prefer-tacit': ['error'],
  },

  // overrides: [
  //   {
  //     files: [TEST_GLOBS],
  //     rules: {
  //       'functional/immutable-data': 'off',
  //     },
  //   },
  // ],
};
