/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();

const handlers = require('./handlers');
const commentIdParser = require('./lib/commentIdParser');
const jsonParser = require('body-parser').json();

router.post('/', jsonParser, handlers.create);

router.use('/:commentId', commentIdParser);

router.post('/:commentId', jsonParser, handlers.change);
router.delete('/:commentId', jsonParser, handlers.remove);

module.exports = router;
