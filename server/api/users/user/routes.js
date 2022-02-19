/* eslint-disable new-cap */

const skipLimitParser = require('georap-middlewares').skipLimitParser;
const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

// Single user

router.get('/', handlers.getOne);
router.get('/events', skipLimitParser, handlers.getEvents);
router.get('/flags', handlers.getFlags);

module.exports = router;
