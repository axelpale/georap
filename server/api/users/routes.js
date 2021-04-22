/* eslint-disable new-cap */

const handlers = require('./handlers');
const usernameParser = require('./lib/usernameParser.js');
const userRouter = require('./user/routes');
const express = require('express');
const router = express.Router();

// User collection

router.get('/', handlers.getAll);

// Single user

router.use('/:username', usernameParser, userRouter);

module.exports = router;
