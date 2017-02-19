/* eslint-disable new-cap */

var express = require('express');
var router = express.Router();

var handlers = require('./handlers');
var entryIdParser = require('../lib/entryIdParser');
var jsonParser = require('body-parser').json();

router.post('/', jsonParser, handlers.create);

router.use('/:entryId', entryIdParser);

router.delete('/:entryId', handlers.remove);

module.exports = router;
