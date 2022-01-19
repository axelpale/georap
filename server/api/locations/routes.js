/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();
const middlewares = require('georap-middlewares');
const able = require('../able');

const handlers = require('./handlers');
const locationIdParser = require('./lib/locationIdParser');
const locationRouter = require('./location/routes');
const importerRouter = require('./importer/routes');

// Location collection

router.get('/', middlewares.skipLimitParser, handlers.latest);
router.post('/', able('locations-create'), jsonParser, handlers.create);
router.get('/count', handlers.count);
router.get('/search', middlewares.skipLimitParser, handlers.search);

router.use('/import', able('locations-import'), importerRouter);
router.use('/:locationId', locationIdParser, locationRouter);

module.exports = router;
