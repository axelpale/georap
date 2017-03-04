/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

// Single user

router.get('/', handlers.getOne);

module.exports = router;
