/* eslint-disable new-cap */

const accountRouter = require('./account/routes');
const adminRouter = require('./admin/routes');
const attachmentsRouter = require('./attachments/routes');
const entriesRouter = require('./entries/routes');
const eventsRouter = require('./events/routes');
const geometryRouter = require('./geometry/routes');
const iconsRouter = require('./icons/routes');
const localesRouter = require('./locales/routes');
const locationsRouter = require('./locations/routes');
const markersRouter = require('./markers/routes');
const paymentsRouter = require('./payments/routes');
const statisticsRouter = require('./statistics/routes');
const usersRouter = require('./users/routes');

const userDal = require('./users/user/dal');

const authMiddleware = require('./auth');
const status = require('http-status-codes');
const router = require('express').Router();

// Icon routes do not require authentication. Thus before jwt middleware.
router.use('/icons', iconsRouter);

// Locale and translation do not require authentication.
router.use('/locales', localesRouter);

// Account routes only partially require JWT authentication. Thus
// the router is used before the jwt middleware.
router.use('/account', accountRouter);

// Authentication JWT Token middleware.
router.use(authMiddleware);

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

// These routes require authentication.
router.use('/admin', adminRouter);
router.use('/attachments', attachmentsRouter);
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
