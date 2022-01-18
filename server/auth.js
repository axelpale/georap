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
const userDal = require('./api/users/user/dal');

module.exports = jwt({
  secret: config.secret,
  algorithms: ['HS256'],
  credentialsRequired: false,
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
  isRevoked: function (req, payload, done) {
    // Check if user is banned.
    // Check this by querying the database, because it's SIMPLE.
    // This effectively nulls the benefits of using jwt tokens :DD
    // But what the hell...
    if (payload && payload.name) {
      userDal.getOne(payload.name, (err, storedUser) => {
        if (err) {
          return done(err);
        }

        if (storedUser) {
          if (storedUser.status === 'active') {
            return done(null, false);
          }
        }

        // Token revoked
        // TODO ensure this works
        return done(null, true);
      });
    } else {
      return done(null, true);
    }
  },
});
