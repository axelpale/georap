/* eslint-disable new-cap */

var handlers = require('./handlers');
var router = require('express').Router();
var jsonParser = require('body-parser').json();

router.get('/', handlers.getOne);
router.post('/status', jsonParser, handlers.setStatus);
router.post('/role', jsonParser, handlers.setRole);

module.exports = router;
