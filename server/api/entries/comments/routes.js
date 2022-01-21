const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const handlers = require('./handlers');
const grable = require('georap-able');
const commentPreloader = require('./lib/commentPreloader');
const jsonParser = require('body-parser').json();

router.post('/', grable.able('comments-create'),
            jsonParser, handlers.create);

router.use('/:commentId', commentPreloader);

router.post('/:commentId', grable.ableOwn('comments-update'),
            jsonParser, handlers.change);

router.delete('/:commentId', grable.ableOwn('comments-delete'),
              jsonParser, handlers.remove);

module.exports = router;
