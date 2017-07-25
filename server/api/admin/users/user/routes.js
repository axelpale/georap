/* eslint-disable new-cap */

var handlers = require('./handlers');
var router = require('express').Router();
var jsonParser = require('body-parser').json();

// Username parser middleware

router.get('/', handlers.getOne);

router.get('/blacklist', handlers.isBlacklisted);
router.post('/blacklist', jsonParser, handlers.setBlacklisted);

module.exports = router;
