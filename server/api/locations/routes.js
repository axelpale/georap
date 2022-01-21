/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();
const skipLimitParser = require('georap-middlewares').skipLimitParser;
const able = require('georap-able').middleware;

const handlers = require('./handlers');
const locationPreloader = require('./lib/locationPreloader');
const locationRouter = require('./location/routes');
const importerRouter = require('./importer/routes');

// Location collection

router.get('/', skipLimitParser, handlers.latest);
router.post('/', able('locations-create'), jsonParser, handlers.create);
router.get('/count', handlers.count);
router.get('/search', skipLimitParser, handlers.search);

router.use('/import', able('locations-import'), importerRouter);
router.use('/:locationId', locationPreloader, locationRouter);

module.exports = router;
