export const RULE_BAN_TYPES = {
  '@typescript-eslint/ban-types': [
    'error',
    {
      extendDefaults: false,
      types: {
        String: {
          message: 'Use `string` instead.',
          fixWith: 'string',
        },
        Number: {
          message: 'Use `number` instead.',
          fixWith: 'number',
        },
        Boolean: {
          message: 'Use `boolean` instead.',
          fixWith: 'boolean',
        },
        Symbol: {
          message: 'Use `symbol` instead.',
          fixWith: 'symbol',
        },
        Object: {
          message:
            'The `Object` type is mostly the same as `unknown`. You probably want `Record<string, unknown>` instead. See https://github.com/typescript-eslint/typescript-eslint/pull/848',
          fixWith: 'Record<string, unknown>',
        },
        '{}': {
          message:
            'The `{}` type is mostly the same as `unknown`. You probably want `Record<string, unknown>` instead.',
          fixWith: 'Record<string, unknown>',
        },
        object: {
          message:
            'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
          fixWith: 'Record<string, unknown>',
        },
        Function: 'Use a specific function type instead, like `() => void`.',

        // TODO: Try to enable this in 2021.
        // null: {
        // 	message: 'Use `undefined` instead. See: https://github.com/sindresorhus/meta/issues/7',
        // 	fixWith: 'undefined'
        // }

        '[]': "Don't use the empty array type `[]`. It only allows empty arrays. Use `SomeType[]` instead.",
        '[[]]':
          "Don't use `[[]]`. It only allows an array with a single element which is an empty array. Use `SomeType[][]` instead.",
        '[[[]]]': "Don't use `[[[]]]`. Use `SomeType[][][]` instead.",
        '[[[[]]]]': 'ur drunk 🤡',
        '[[[[[]]]]]': '🦄💥',

        'React.FC':
          'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
        'React.FunctionComponent':
          'Useless and has some drawbacks, see https://github.com/facebook/create-react-app/pull/8177',
      },
    },
  ],
};
