/*eslint no-magic-numbers: "off"*/

module.exports = {
  'env': {
    // Node.js global variables and Node.js scoping
    'node': true,

    // Browser global variables
    'browser': true,

    // CommonJS global variables and CommonJS scoping.
    'commonjs': true
  },
  'globals': {
    // place settings for globals here, such as
    'google': true,
    '$': true
  },

  // For available rules, see http://eslint.org/docs/rules/
  'rules': {

    //// POSSIBLE SYNTAX ERRORS

    // disallow assignment operators in conditional expressions
    'no-cond-assign': 2,
    // disallow duplicate arguments in function definitions
    'no-dupe-args': 2,
    // disallow duplicate keys in object literals
    'no-dupe-keys': 2,
    // disallow empty block statements
    'no-empty': 2,
    // disallow reassigning exceptions in catch clauses
    'no-ex-assign': 2,
    // disallow unnecessary boolean casts
    'no-extra-boolean-cast': 2,
    // disallow unnecessary semicolons
    'no-extra-semi': 2,
    // disallow reassigning function declarations
    'no-func-assign': 2,
    // disallow variable or function declarations in nested blocks
    'no-inner-declarations': 2,
    // disallow invalid regular expression strings in RegExp constructors
    'no-invalid-regexp': 2,
    // disallow irregular whitespace outside of strings and comments
    'no-irregular-whitespace': 2,
    // disallow calling global object properties as functions
    'no-obj-calls': 2,
    // disallow multiple spaces in regular expressions
    'no-regex-spaces': 2,
    // disallow sparse arrays
    'no-sparse-arrays': 2,
    // disallow confusing multiline expressions
    'no-unexpected-multiline': 2,
    // disallow unreachable code after return, throw, continue,
    // and break statements
    'no-unreachable': 2,
    // disallow control flow statements in finally blocks
    'no-unsafe-finally': 2,
    // require calls to isNaN() when checking for NaN
    'use-isnan': 2,
    // enforce comparing typeof expressions against valid strings
    'valid-typeof': 2,

    //// BEST PRACTICES

    // enforce return statements in callbacks of array methods
    'array-callback-return': 2,
    // enforce the use of variables within the scope they are defined
    'block-scoped-var': 2,
    // enforce consistent brace style for all control statements
    'curly': [2, 'all'],
    // require default cases in switch statements
    'default-case': 2,
    // enforce consistent newlines before and after dots
    'dot-location': [2, 'property'],
    // enforce dot notation whenever possible
    'dot-notation': 2,
    // require the use of === and !==
    'eqeqeq': 2,
    // require for-in loops to include an if statement
    'guard-for-in': 2,
    // disallow the use of alert, confirm, and prompt
    'no-alert': 2,
    // disallow the use of arguments.caller or arguments.callee
    'no-caller': 2,
    // disallow lexical declarations in case clauses
    'no-case-declarations': 2,
    // disallow division operators explicitly at the beginning of
    // regular expressions
    'no-div-regex': 2,
    // disallow else blocks after return statements in if statements
    'no-else-return': 2,
    // disallow empty functions
    'no-empty-function': 0,
    // disallow empty destructuring patterns
    'no-empty-pattern': 2,
    // disallow null comparisons without type-checking operators
    'no-eq-null': 2,
    // disallow unnecessary labels
    'no-extra-label': 2,
    // disallow fallthrough of case statements
    'no-fallthrough': 2,
    // disallow leading or trailing decimal points in numeric literals
    'no-floating-decimal': 2,
    // disallow assignments to native objects or read-only global variables
    'no-global-assign': 2,
    // disallow shorthand type conversions
    'no-implicit-coercion': 2,
    // disallow this keywords outside of classes or class-like objects
    'no-invalid-this': 2,
    // disallow labeled statements
    'no-labels': 2,
    // disallow unnecessary nested blocks
    'no-lone-blocks': 2,
    // disallow function declarations and expressions inside loop statements
    'no-loop-func': 2,
    // disallow magic numbers
    'no-magic-numbers': [2, { ignore: [0, 1, 2] }],
    // disallow multiple spaces
    'no-multi-spaces': 2,
    // disallow multiline strings
    'no-multi-str': 2,
    // disallow new operators with the Function object
    'no-new-func': 2,
    // disallow new operators with the String, Number, and Boolean objects
    'no-new-wrappers': 2,
    // disallow new operators outside of assignments or comparisons
    'no-new': 2,
    // disallow octal escape sequences in string literals
    'no-octal-escape': 2,
    // disallow octal literals
    'no-octal': 2,
    // disallow reassigning function parameters
    'no-param-reassign': 2,
    // disallow the use of the __proto__ property
    'no-proto': 2,
    // disallow variable redeclaration
    'no-redeclare': 2,
    // disallow assignment operators in return statements
    'no-return-assign': 2,
    // disallow assignments where both sides are exactly the same
    'no-self-assign': 2,
    // disallow comparisons where both sides are exactly the same
    'no-self-compare': 2,
    // disallow comma operators
    'no-sequences': 2,
    // disallow throwing literals as exceptions
    'no-throw-literal': 2,
    // disallow unmodified loop conditions
    'no-unmodified-loop-condition': 2,
    // disallow unused expressions
    'no-unused-expressions': 2,
    // disallow unnecessary calls to .call() and .apply()
    'no-useless-call': 2,
    // disallow unnecessary concatenation of literals or template literals
    'no-useless-concat': 2,
    // disallow unnecessary escape characters
    'no-useless-escape': 2,
    // disallow void operators
    'no-void': 2,
    // disallow with statements
    'no-with': 2,
    // enforce the consistent use of the radix argument when using parseInt()
    'radix': 2,
    // require var declarations be placed at the top of their containing scope
    'vars-on-top': 0,
    // require parentheses around immediate function invocations
    'wrap-iife': 2,
    // require or disallow “Yoda” conditions
    'yoda': 2
  },
  'plugins': [
    // you can put plugins here
  ]
}
