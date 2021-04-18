const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const entryIdParser = require('./lib/entryIdParser');
const commentsRouter = require('./comments/routes');

router.post('/', jsonParser, handlers.create);

router.use('/:entryId', entryIdParser);

router.post('/:entryId', jsonParser, handlers.change);
router.delete('/:entryId', handlers.remove);

router.post('/:entryId/move', jsonParser, handlers.move);
router.use('/:entryId/comments', commentsRouter);

module.exports = router;
