/* eslint-disable new-cap */

var express = require('express');
var router = express.Router();

var handlers = require('./handlers');
var entryIdParser = require('./lib/entryIdParser');
var jsonParser = require('body-parser').json();

router.post('/', handlers.create); // uses multer body-parser inside

router.use('/:entryId', entryIdParser);

router.post('/:entryId', handlers.change);  // uses multer body-parser inside
router.delete('/:entryId', jsonParser, handlers.remove);
router.post('/:entryId/comments', jsonParser, handlers.createComment);

module.exports = router;
