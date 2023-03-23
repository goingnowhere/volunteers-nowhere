module.exports = {
  env: {
    node: true,
    browser: true,
  },
  plugins: [
    'meteor',
    'underscore',
    'react-hooks',
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
    ],
  },
  globals: {
    _: false,
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
        '__',
        '_name',
      ],
    },
    ],
    'no-param-reassign': ['error', { props: false }],
    'implicit-arrow-linebreak': ['off'],
    'arrow-body-style': 'off',
    // Remove if we replace confirms with something better
    'no-alert': 'off',
    'one-var': 'off',
    'one-var-declaration-per-line': ['error', 'initializations'],
    'no-new': 'off', // Commonly used in Meteor
    'object-shorthand': ['error', 'always'],
    'arrow-parens': 'off',
    'no-nested-ternary': 'off',
    'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'always', { js: 'never' }],
    'import/no-unresolved': ['error', {
      ignore: [
        'meteor',
      ],
    }],
    'meteor/eventmap-params': ['error', {
      templateInstanceParamName: 'template',
    }],
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-fragments': ['warn', 'syntax'],
    'react/jsx-props-no-spreading': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/label-has-associated-control': ['error', {
      controlComponents: ['Field'],
    }],
    'jsx-a11y/label-has-for': 'off', // Deprecated for above
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    // Below added to workaround babel-eslint bug github.com/babel/babel-eslint/issues/799
    indent: [
      'error',
      2,
      {
        ignoredNodes: [
          'TemplateLiteral',
        ],
      },
    ],
    'template-curly-spacing': ['off', 'never'],
    // end bugfix
  },
}
