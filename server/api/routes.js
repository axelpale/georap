/* eslint-disable new-cap */

var eventsRouter = require('./events/routes');
var locationsRouter = require('./locations/routes');

var local = require('../../config/local');
var jwt = require('express-jwt');
var status = require('http-status-codes');
var express = require('express');
var router = express.Router();

// Token middleware. User can access the routes only with valid token.
// Token contents are stored in req.user.
// See https://github.com/auth0/express-jwt
router.use(jwt({ secret: local.secret }));

router.use('/events', eventsRouter);
router.use('/locations', locationsRouter);

// Token error handling
// See http://expressjs.com/en/guide/error-handling.html
router.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.sendStatus(status.UNAUTHORIZED);
  }
  return next();
});

module.exports = router;
