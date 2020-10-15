/* eslint-disable new-cap */

var config = require('tresdb-config');

var accountRouter = require('./account/routes');
var adminRouter = require('./admin/routes');
var eventsRouter = require('./events/routes');
var iconsRouter = require('./icons/routes');
var locationsRouter = require('./locations/routes');
var markersRouter = require('./markers/routes');
var paymentsRouter = require('./payments/routes');
var statisticsRouter = require('./statistics/routes');
var usersRouter = require('./users/routes');

var userDal = require('./users/user/dal');

var jwt = require('express-jwt');
var status = require('http-status-codes');
var router = require('express').Router();

// Icon routes do not require authentication. Thus before jwt middleware.
router.use('/icons', iconsRouter);

// Account routes only partially require JWT authentication. Thus
// the router is used before the jwt middleware.
router.use('/account', accountRouter);

// Token middleware. User can access the routes only with valid token.
// Token contents are stored in req.user with properties:
//
// req.user = {
//   name
//   admin
// }
//
// See https://github.com/auth0/express-jwt
router.use(jwt({
  secret: config.secret,
  algorithms: ['HS256'],
  getToken: function fromHeaderOrQuerystring(req) {
    // Copied from https://github.com/auth0/express-jwt#usage
    var header = req.headers.authorization;
    if (header && header.split(' ')[0] === 'Bearer') {
      return header.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
}));

// Check if user is banned.
router.use(function (req, res, next) {

  // Check this by querying the database, because it's SIMPLE.
  // This effectively nulls the benefits of using jwt tokens :DD
  // But what the hell...
  userDal.getOne(req.user.name, function (err, storedUser) {
    if (err) {
      return next(err);
    }

    if (storedUser) {
      if (storedUser.status === 'active') {
        return next();
      }
    }

    // User does not exist or is banned
    return res.sendStatus(status.FORBIDDEN);
  });
});

router.use('/admin', adminRouter);
router.use('/events', eventsRouter);
router.use('/locations', locationsRouter);
router.use('/markers', markersRouter);
router.use('/payments', paymentsRouter);
router.use('/statistics', statisticsRouter);
router.use('/users', usersRouter);

// API error handling
// See http://expressjs.com/en/guide/error-handling.html
router.use(function (err, req, res, next) {
  // Token error handling
  if (err.name === 'UnauthorizedError') {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  // Default error handler
  return next(err);
});

// Catch all other non-errored API calls to 404.
// Must be the final step in this router.
router.get('/*', function (req, res) {
  console.log('404 Not Found: ' + req.originalUrl);
  return res.sendStatus(status.NOT_FOUND);
});

module.exports = router;
