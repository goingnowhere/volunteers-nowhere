module.exports = {
  env: {
    node: true,
    browser: true,
  },
  plugins: [
    'meteor',
    'underscore',
  ],
  extends: [
    '@meteorjs/eslint-config-meteor',
    'airbnb-base',
    'plugin:meteor/recommended',
  ],
  settings: {
    'import-resolver': 'meteor',
    'import/core-modules': [
      'meteor',
    ]
  },
  globals: {
    Meteor: true,
    "_": false
  },
  rules: {
    semi: ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'no-underscore-dangle': ['error', {
        allow: [
          '_id',
          '_ensureIndex',
          '__',
        ],
      },
    ],
    'no-param-reassign': ['error', { props: false }],
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'never', { js: 'never' }],
    'import/no-unresolved': ['error', {
      ignore: [
        'meteor',
      ],
    }],
    'meteor/eventmap-params': ['error', {
      "templateInstanceParamName": "template",
    }],
    'react/jsx-one-expression-per-line': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
}
