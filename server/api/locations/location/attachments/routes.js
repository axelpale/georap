/* eslint-disable new-cap */

var express = require('express');
var router = express.Router();

var handlers = require('./handlers');
var entryIdParser = require('../lib/entryIdParser');

router.post('/', handlers.create);

router.use('/:entryId', entryIdParser);

router.delete('/:entryId', handlers.remove);

module.exports = router;
