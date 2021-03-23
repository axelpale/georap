/* eslint-disable new-cap */

var router = require('express').Router();
var jsonParser = require('body-parser').json();

var handlers = require('./handlers');
var locationIdParser = require('./lib/locationIdParser');
var locationRouter = require('./location/routes');
var importerRouter = require('./importer/routes');

// Location collection

router.get('/', handlers.latest);
router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);

router.use('/import', importerRouter);
router.use('/:locationId', locationIdParser, locationRouter);

module.exports = router;
