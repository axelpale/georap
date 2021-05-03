/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');

router.post('/', handlers.import);  // uses multer body-parser inside
router.get('/:batchId/outcome', handlers.getOutcome);
router.get('/:batchId', handlers.getBatch);
router.post('/:batchId', jsonParser, handlers.runBatch);

module.exports = router;
