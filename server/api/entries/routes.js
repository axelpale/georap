const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();
const middlewares = require('georap-middlewares');

const handlers = require('./handlers');
const entryIdParser = require('./lib/entryIdParser');
const locationIdParser = require('./lib/locationIdParser');
const commentsRouter = require('./comments/routes');

router.get('/', middlewares.skipLimitParser, handlers.getLatest);
router.post('/', jsonParser, locationIdParser, handlers.create);

router.use('/:entryId', entryIdParser);

router.post('/:entryId', jsonParser, handlers.change);
router.delete('/:entryId', handlers.remove);

router.post('/:entryId/move', jsonParser, handlers.move);
router.use('/:entryId/comments', commentsRouter);

module.exports = router;
