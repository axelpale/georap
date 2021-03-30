/* eslint-disable new-cap */

var express = require('express');
var router = express.Router();

var handlers = require('./handlers');
var commentIdParser = require('./lib/commentIdParser');
var jsonParser = require('body-parser').json();

router.post('/', jsonParser, handlers.create);

router.use('/:commentId', commentIdParser);

router.post('/:commentId', jsonParser, handlers.change);
router.delete('/:commentId', jsonParser, handlers.remove);

module.exports = router;
