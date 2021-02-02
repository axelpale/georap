
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
  },

  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },

  globals: {
    tresdb: true,
  },
};
