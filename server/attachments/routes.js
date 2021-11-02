/* eslint-disable new-cap */

const attachmentLoader = require('../api/attachments/lib/attachmentLoader');
const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

router.get('/:attachmentKey', attachmentLoader, handlers.show);

module.exports = router;
