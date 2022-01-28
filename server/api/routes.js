/* eslint-disable new-cap */

const accountRouter = require('./account/routes');
const adminRouter = require('./admin/routes');
const attachmentsRouter = require('./attachments/routes');
const postsRouter = require('./posts/routes');
const eventsRouter = require('./events/routes');
const geometryRouter = require('./geometry/routes');
const iconsRouter = require('./icons/routes');
const locationsRouter = require('./locations/routes');
const markersRouter = require('./markers/routes');
const statisticsRouter = require('./statistics/routes');
const usersRouter = require('./users/routes');

const able = require('georap-able').able;
const status = require('http-status-codes');
const router = require('express').Router();

// Icons are fully public and requires no capabilities
router.use('/icons', iconsRouter);

// Account checks capabilities deeper.
router.use('/account', accountRouter);

router.use('/admin', able('admin-users-read'), adminRouter);
router.use('/attachments', able('attachments-read'), attachmentsRouter);
router.use('/posts', able('posts-read'), postsRouter);
router.use('/events', able('locations-read'), eventsRouter);
router.use('/geometry', able('geometry-read'), geometryRouter);
router.use('/locations', able('locations-read'), locationsRouter);
router.use('/markers', able('locations-read'), markersRouter);
router.use('/statistics', able('statistics-read'), statisticsRouter);
router.use('/users', able('users-read'), usersRouter);
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
