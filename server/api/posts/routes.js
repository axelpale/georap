const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();
const skipLimitParser = require('georap-middlewares').skipLimitParser;
const handlers = require('./handlers');
const entryPreloader = require('./lib/entryPreloader');
const locationPreloader = require('./lib/locationPreloader');
const commentsRouter = require('./comments/routes');
const grable = require('georap-able');

const able = grable.able;
const ableOwn = grable.ableOwn;

router.get('/', skipLimitParser, handlers.latest);

router.post('/', able('posts-create'), jsonParser,
            locationPreloader, handlers.create);

router.use('/:entryId', entryPreloader);

router.post('/:entryId', ableOwn('posts-update'),
            jsonParser, handlers.change);

router.delete('/:entryId', ableOwn('posts-delete'), handlers.remove);

router.post('/:entryId/move', ableOwn('posts-move'),
            jsonParser, handlers.move);

router.use('/:entryId/comments', able('comments-read'), commentsRouter);

module.exports = router;
