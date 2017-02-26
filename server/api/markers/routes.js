/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

router.get('/', handlers.getWithin);
router.get('/search', handlers.getFiltered);

module.exports = router;
