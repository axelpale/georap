/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');
const locationIdParser = require('./lib/locationIdParser');
const locationRouter = require('./location/routes');
const importerRouter = require('./importer/routes');

// Location collection

router.get('/', handlers.latest);
router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.get('/search', handlers.search);

router.use('/import', importerRouter);
router.use('/:locationId', locationIdParser, locationRouter);

module.exports = router;
