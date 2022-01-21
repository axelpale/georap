// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const attachmentPreloader = require('./lib/attachmentPreloader');
const attachmentRouter = require('./attachment/routes');

router.get('/', handlers.getAll);
router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.use('/:attachmentKey', attachmentPreloader, attachmentRouter);

module.exports = router;
