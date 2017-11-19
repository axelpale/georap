/* eslint-disable new-cap */

var router = require('express').Router();
var jsonParser = require('body-parser').json();

var handlers = require('./handlers');

router.post('/', handlers.import);  // uses multer body-parser inside
router.get('/:batchId/outcome', handlers.getOutcome);
router.get('/:batchId', handlers.getBatch);
router.post('/:batchId', jsonParser, handlers.importBatch);

module.exports = router;
