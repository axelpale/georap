/* eslint-disable new-cap */
var locations = require('../handlers/locations');

var express = require('express');
var router = express.Router();

// Locations
router.post('/locations/:locationId/attachments', locations.addAttachment);


module.exports = router;
