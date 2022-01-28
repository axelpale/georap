/* eslint-disable new-cap */

const handlers = require('./handlers');
const kmlRouter = require('./kml/routes');
const express = require('express');
const able = require('georap-able').able;
const router = express.Router();

router.get('/', handlers.getWithin);
router.get('/search', able('locations-search'), handlers.getFiltered);
router.get('/filtered', able('locations-filter'), handlers.getFilteredWithin);

router.use('/kml', kmlRouter);

module.exports = router;
