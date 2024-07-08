// import { TEST_GLOBS } from '../constants';

import {
  ESLINT_OVERRIDES,
  TYPESCRIPT_ESLINT_OVERRIDES,
} from '../plugin-overrides';
import {
  NO_EXTRANEOUS_DEPENDENCIES,
  RN_NO_RAW_TEXT,
} from '../rule-configurations';

export const REACT_NATIVE = {
  settings: { react: { version: 'detect' } },
  extends: [
    // React + TS base configs:
    'xo-react/space',

    // React Native standards: includes standard react plugins like hook rules and a11y
    '@react-native-community',
    'plugin:react-native-a11y/all',
  ],
  rules: {
    ...ESLINT_OVERRIDES,
    ...TYPESCRIPT_ESLINT_OVERRIDES,

    // ─────────────────────────────────────────────────────────────────

    ...NO_EXTRANEOUS_DEPENDENCIES,

    // ─────────────────────────────────────────────────────────────────

    // React

    'react/prop-types': 'off', // @reason: we use TS for this
    'react/require-default-props': ['off'], // @reason: can optionally use default assignments for this
    'react/jsx-props-no-spreading': ['off'], // @reason: I go back and forth on this. Open to revisiting
    'react/destructuring-assignment': 'off', // @reason: sometimes it's cleaner to keep the `obj.thing` namespace
    'react/boolean-prop-naming': ['off'], // @reason: there are too many instances where it clashes with intrinsic props eg disabled vs isDisabled.
    'react/react-in-jsx-scope': ['off'], // @reason: no longer required.
    'react/hook-use-state': 'off', // @reason: Im an artist. I can't work like this.
    'react/no-unstable-nested-components': 'error', // @reason: we don't want to cause extra renders, or bloat the ones we have (eg when memoizing)
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: true,
        allowNamespace: true,
        allowLeadingUnderscore: false,
        // ignore: ['dank__ComPOnEnt', 'Dank_*_component']
      },
    ],

    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['arrow-function'],
        unnamedComponents: ['arrow-function'],
      },
    ],

    'react/style-prop-object': [
      'error',
      {
        allow: ['StatusBar'],
      },
    ],

    ...RN_NO_RAW_TEXT,

    // ────────────────────────────────────────────────────────────────────────────────

    // React Native
    'react-native/no-color-literals': ['error'],
    'react-native/no-inline-styles': ['error'],
    'react-native/no-unused-styles': 'error',

    // RN A11Y
    'react-native-a11y/has-accessibility-hint': 'off',
  },

  // overrides: [
  //   {
  //     files: [TEST_GLOBS],
  //     rules: {
  //       'react-native/no-raw-text': 'off',
  //       'react-native/no-inline-styles': 'off',
  //     },
  //   },
  // ],
};
