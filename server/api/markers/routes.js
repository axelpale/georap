/* eslint-disable new-cap */

const handlers = require('./handlers');
const kmlRouter = require('./kml/routes');
const express = require('express');
const router = express.Router();

router.get('/', handlers.getWithin);
router.get('/search', handlers.getFiltered);
router.get('/filtered', handlers.getFilteredWithin);

router.use('/kml', kmlRouter);

module.exports = router;
