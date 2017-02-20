/* eslint-disable new-cap */

var local = require('../../config/local');

var accountRouter = require('./account/routes');
var eventsRouter = require('./events/routes');
var locationsRouter = require('./locations/routes');
var markersRouter = require('./markers/routes');
var usersRouter = require('./users/routes');

var jwt = require('express-jwt');
var status = require('http-status-codes');
var router = require('express').Router();

// Account routes only partially require JWT authentication. Thus
// the router is used before the jwt middleware.
router.use('/account', accountRouter);

// Token middleware. User can access the routes only with valid token.
// Token contents are stored in req.user.
// See https://github.com/auth0/express-jwt
router.use(jwt({ secret: local.secret }));

router.use('/events', eventsRouter);
router.use('/locations', locationsRouter);
router.use('/markers', markersRouter);
router.use('/users', usersRouter);

// Token error handling
// See http://expressjs.com/en/guide/error-handling.html
router.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  // Log other API errors to ease debugging.
  console.error(err);

  return next();
});

module.exports = router;
