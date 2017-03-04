/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

router.get('/', handlers.getKML);
router.get('/network', handlers.getNetworkKML);

module.exports = router;
