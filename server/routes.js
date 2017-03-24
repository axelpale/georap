/* eslint-disable new-cap */

var apiRouter = require('./api/routes');
var clientRouter = require('./client/routes');
var router = require('express').Router();

router.use('/api', apiRouter);

// Catch all others and response with the client app. This enables the use of
// client-defined routing (e.g. page.js).
router.use('/', clientRouter);

module.exports = router;
