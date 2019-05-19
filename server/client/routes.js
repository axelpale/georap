/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

// Support for Add Home Screen.
router.get('/manifest.webmanifest', handlers.getManifest);

// Route all else to the client app
router.get('/*', handlers.get);

module.exports = router;
