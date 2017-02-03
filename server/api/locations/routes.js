/* eslint-disable new-cap */

var handlers = require('../../handlers/locations');
var express = require('express');
var router = express.Router();

// Locations
router.post('/:locationId/attachments', handlers.addAttachment);

module.exports = router;
