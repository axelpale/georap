// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const attachmentLoader = require('./lib/attachmentLoader');
const attachmentRouter = require('./attachment/routes');
const scaffoldRouter = require('./scaffold/routes');

router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.use('/scaffold', scaffoldRouter);
router.use('/:attachmentKey', attachmentLoader, attachmentRouter);

module.exports = router;
