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
const grable = require('georap-able');

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
          // account exists.
          if (!storedUser.deleted) {
            // account is not soft-deleted.
            if (payload.role === storedUser.role) {
              // account role has not changed.
              if (grable.isAble(storedUser, 'account-auth')) {
                // Account has role that allows authentication.
                // By ensuring that here, we do not accidentally allow access
                // in the case when we remove 'account-auth' cap form role.
                return done(null, false);
              }
            }
          }
        }

        // Token revoked
        // TODO ensure this works
        return done(null, true);
      });
    } else {
      // Token payload is not an user or is an anon user, e.g. during signup.
      // Token is not revoked. Token is valid because it is issued and signed
      // by the server.
      return done(null, false);
    }
  },
});
