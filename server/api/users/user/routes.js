/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

// Single user

router.get('/', handlers.getOneWithEvents);
router.get('/flags', handlers.getFlags);

module.exports = router;
