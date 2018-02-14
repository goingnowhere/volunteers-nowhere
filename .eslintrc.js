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
        ],
      },
    ],
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
  },
}
