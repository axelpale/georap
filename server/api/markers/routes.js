/* eslint-disable new-cap */

var handlers = require('./handlers');
var kmlRouter = require('./kml/routes');
var express = require('express');
var router = express.Router();

router.get('/', handlers.getWithin);
router.get('/search', handlers.getFiltered);

router.use('/kml', kmlRouter);

module.exports = router;
