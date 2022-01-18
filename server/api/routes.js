/* eslint-disable new-cap */

const accountRouter = require('./account/routes');
const adminRouter = require('./admin/routes');
const attachmentsRouter = require('./attachments/routes');
const entriesRouter = require('./entries/routes');
const eventsRouter = require('./events/routes');
const geometryRouter = require('./geometry/routes');
const iconsRouter = require('./icons/routes');
const locationsRouter = require('./locations/routes');
const markersRouter = require('./markers/routes');
const statisticsRouter = require('./statistics/routes');
const usersRouter = require('./users/routes');

const able = require('./able');
const status = require('http-status-codes');
const router = require('express').Router();

router.use('/icons', able('locations'), iconsRouter);
router.use('/account', accountRouter);
router.use('/admin', able('admin'), adminRouter);
router.use('/attachments', able('posts'), attachmentsRouter);
router.use('/entries', able('posts'), entriesRouter);
router.use('/events', able('locations'), eventsRouter);
router.use('/geometry', able('geometry'), geometryRouter);
router.use('/locations', able('locations'), locationsRouter);
router.use('/markers', able('locations'), markersRouter);
router.use('/statistics', able('statistics'), statisticsRouter);
router.use('/users', able('users'), usersRouter);
// router.use('/locales', localesRouter); TODO is any use?
// router.use('/payments', paymentsRouter); TODO is any use?

// API error handling
// See http://expressjs.com/en/guide/error-handling.html
router.use((err, req, res, next) => {
  // Token error handling TODO maybe deprecated
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
