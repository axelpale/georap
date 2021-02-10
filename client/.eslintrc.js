
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

  globals: {
    tresdb: true,
  },
};
