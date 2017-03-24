/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

// Catch all
router.get('/*', handlers.get);

module.exports = router;
