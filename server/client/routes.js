/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

// Web manifest. Support for Add Home Screen.
router.get('/manifest.webmanifest', handlers.getManifest);

// Route all else to the client app
router.get('/*', handlers.get);

module.exports = router;
