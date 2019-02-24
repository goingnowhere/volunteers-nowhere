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
    'semi-style': ['error', 'first'],
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }],
    'no-underscore-dangle': ['off', {
        allow: [
          '_id',
          '_ensureIndex',
          '__',
          '_name',
        ],
      },
    ],
    'no-param-reassign': ['error', { props: false }],
    'implicit-arrow-linebreak': ['off'],
    // Remove if we replace confirms with something better
    'no-alert': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'always', { js: 'never' }],
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
    'jsx-a11y/label-has-associated-control': ['error', {
      controlComponents: ['Field'],
    }],
    'jsx-a11y/label-has-for': 'off', // Deprecated for above
  },
}
