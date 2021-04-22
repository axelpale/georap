/* eslint-disable new-cap */

const apiRouter = require('./api/routes');
const clientRouter = require('./client/routes');
const router = require('express').Router();

router.use('/api', apiRouter);

// Catch all others and response with the client app. This enables the use of
// client-defined routing (e.g. page.js).
router.use('/', clientRouter);

module.exports = router;
