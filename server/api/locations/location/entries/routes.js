const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const handlers = require('./handlers');
const entryIdParser = require('./lib/entryIdParser');
const commentsRouter = require('./comments/routes');

router.post('/', handlers.create); // uses multer body-parser inside

router.use('/:entryId', entryIdParser);

router.post('/:entryId', handlers.change);  // uses multer body-parser inside
router.delete('/:entryId', handlers.remove);

router.use('/:entryId/comments', commentsRouter);

module.exports = router;
