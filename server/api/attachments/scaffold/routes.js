// Attachment uploader for testing
//
const router = require('express').Router(); // eslint-disable-line new-cap
const handlers = require('./handlers');

router.get('/', handlers.get);

module.exports = router;
