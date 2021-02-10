// Attachment collection

var router = require('express').Router(); // eslint-disable-line new-cap
var jsonParser = require('body-parser').json();

var handlers = require('./handlers');
var attachmentIdParser = require('./lib/attachmentIdParser');
var attachmentRouter = require('./attachment/routes');

router.get('/', handlers.get);
router.post('/', jsonParser, handlers.rotatePhoto);
router.delete('/', handlers.remove);

module.exports = router;
