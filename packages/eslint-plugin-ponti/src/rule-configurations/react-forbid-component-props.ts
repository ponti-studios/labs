export const FORBID_COMPONENT_PROPS = {
  'react/forbid-component-props': [
    'error',
    {
      forbid: [
        {
          propName: 'type',
          allowedFor: [],
          message:
            'Detected `type` prop. Regrets for the inconvenience, but can we change this to something with higher-specificity semantics. (Trust me!)',
        },
      ],
    },
  ],
};
