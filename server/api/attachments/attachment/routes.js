// Attachment collection

const router = require('express').Router(); // eslint-disable-line new-cap
const jsonParser = require('body-parser').json();
const handlers = require('./handlers');
const grable = require('georap-able');
const ableOwn = grable.ableOwn;

router.get('/', handlers.get);

router.post('/', ableOwn('attachments-update'),
            jsonParser, handlers.rotateImage);

router.delete('/', ableOwn('attachments-delete'),
              handlers.remove);

module.exports = router;
