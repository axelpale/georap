// Attachment collection

var router = require('express').Router(); // eslint-disable-line new-cap
var jsonParser = require('body-parser').json();

var handlers = require('./handlers');
var attachmentLoader = require('./lib/attachmentLoader');
var attachmentRouter = require('./attachment/routes');

router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.use('/:attachmentKey', attachmentLoader, attachmentRouter);

module.exports = router;
