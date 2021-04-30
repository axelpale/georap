/* eslint-disable new-cap */

const config = require('georap-config');

const accountRouter = require('./account/routes');
const adminRouter = require('./admin/routes');
const attachmentsRouter = require('./attachments/routes');
const entriesRouter = require('./entries/routes');
const eventsRouter = require('./events/routes');
const geometryRouter = require('./geometry/routes');
const iconsRouter = require('./icons/routes');
const locationsRouter = require('./locations/routes');
const markersRouter = require('./markers/routes');
const paymentsRouter = require('./payments/routes');
const statisticsRouter = require('./statistics/routes');
const usersRouter = require('./users/routes');

const userDal = require('./users/user/dal');

const jwt = require('express-jwt');
const status = require('http-status-codes');
const router = require('express').Router();

// Icon routes do not require authentication. Thus before jwt middleware.
router.use('/icons', iconsRouter);

// Scaffold routes do not require authentication but must be removed
// or closed after development.
router.use('/attachments', attachmentsRouter);

// Account routes only partially require JWT authentication. Thus
// the router is used before the jwt middleware.
router.use('/account', accountRouter);

// Token middleware. User can access the routes only with a valid token.
// Token contents are stored in req.user with properties:
//
// req.user = {
//   name: <string>,
//   email: <string>,
//   admin: <bool>,
// }
//
// See https://github.com/auth0/express-jwt
router.use(jwt({
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
}));

// Check if user is banned.
router.use((req, res, next) => {

  // Check this by querying the database, because it's SIMPLE.
  // This effectively nulls the benefits of using jwt tokens :DD
  // But what the hell...
  userDal.getOne(req.user.name, (err, storedUser) => {
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
router.use('/entries', entriesRouter);
router.use('/events', eventsRouter);
router.use('/geometry', geometryRouter);
router.use('/locations', locationsRouter);
router.use('/markers', markersRouter);
router.use('/payments', paymentsRouter);
router.use('/statistics', statisticsRouter);
router.use('/users', usersRouter);

// API error handling
// See http://expressjs.com/en/guide/error-handling.html
router.use((err, req, res, next) => {
  // Token error handling
  if (err.name === 'UnauthorizedError') {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  // Default error handler
  return next(err);
});

// Catch all other non-errored API calls to 404.
// Must be the final step in this router.
router.get('/*', (req, res) => {
  console.log('404 Not Found: ' + req.originalUrl);
  return res.sendStatus(status.NOT_FOUND);
});

module.exports = router;
