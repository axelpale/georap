/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

router.get('/', handlers.getRecent);

module.exports = router;
