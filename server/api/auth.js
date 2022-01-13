// Authentication JWT token middleware.
// Routes that apply this middleware can be accessed only with a valid token.
// Token contents are stored in req.user with properties:
//
// req.user = {
//   name: <string>,
//   email: <string>,
//   role: <string>,
// }
//
// See https://github.com/auth0/express-jwt
//
// Archi note: dry code - specify jwt token handling only here.
//
const jwt = require('express-jwt');
const config = require('georap-config');

module.exports = jwt({
  secret: config.secret,
  algorithms: ['HS256'],
  getToken: function fromHeaderOrQuerystring(req) {
    // Copied from https://github.com/auth0/express-jwt#usage
    const header = req.headers.authorization;
    if (header && header.split(' ')[0] === 'Bearer') {
      return header.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
});
