/* eslint-disable new-cap */

var eventsRouter = require('./events/routes');
var locationsRouter = require('./locations/routes');

var express = require('express');
var router = express.Router();

router.use('/events', eventsRouter);
router.use('/locations', locationsRouter);

module.exports = router;
