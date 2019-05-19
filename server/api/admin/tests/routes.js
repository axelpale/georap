/* eslint-disable new-cap */

var handlers = require('./handlers');
var router = require('express').Router();

router.get('/throw-error', handlers.throwError);
router.get('/next-error', handlers.nextError);

module.exports = router;
