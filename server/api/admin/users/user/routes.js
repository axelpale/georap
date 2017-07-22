/* eslint-disable new-cap */

var handlers = require('./handlers');
var router = require('express').Router();

router.get('/', handlers.getOneWithExtras);

module.exports = router;
