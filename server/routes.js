/* eslint-disable new-cap */

const authMiddleware = require('./auth');
const apiRouter = require('./api/routes');
const clientRouter = require('./client/routes');
const router = require('express').Router();

// Authentication JWT Token middleware.
// After this, availability of req.user tells if user has been authenticated.
// Will pass unknown users but will leave req.user unset if so.
// Unset req.user implies public user capabilities.
router.use('/api', authMiddleware, apiRouter);

// Catch all others and response with the client app. This enables the use of
// client-defined routing (e.g. page.js).
router.use('/', clientRouter);

module.exports = router;
