import { ESLINT_OVERRIDES } from '../plugin-overrides';

export const BASE = {
  extends: ['xo-space'],
  rules: {
    ...ESLINT_OVERRIDES,
    'import/prefer-default-export': ['off'],
  },
};
