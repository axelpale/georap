
module.exports = {
  env: {
    // Browser global variables
    browser: true,

    // jQuery global variables
    jquery: true,

    // CommonJS global variables and CommonJS scoping.
    commonjs: true,

    // Disable node environment
    node: false,

    // Try to support ES5
    es6: false,
  },

  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'no-var': 'off',
    'prefer-arrow-callback': 'off',
    'prefer-const': 'off',
  },

  globals: {
    tresdb: true,
  },
};
