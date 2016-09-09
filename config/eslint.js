module.exports = {
  "env": {
    // Node.js global variables and Node.js scoping
    "node": true,

    // Browser global variables
    "browser": true,

    // CommonJS global variables and CommonJS scoping.
    "commonjs": true
  },
  "globals": {
    // place settings for globals here, such as
    "google": true,
    "$": true
  },
  "rules": {
    // enable ESLint rules, such as
    "eqeqeq": 1,
    // Disallow var redeclaration
    "no-redeclare": 1
  },
  "plugins": [
    // you can put plugins here
  ]
}
