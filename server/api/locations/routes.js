/* eslint-disable new-cap */

var router = require('express').Router();
var jsonParser = require('body-parser').json();

var handlers = require('./handlers');
var locationIdParser = require('./lib/locationIdParser');
var locationRouter = require('./location/routes');

// Location collection

router.post('/', jsonParser, handlers.create);
router.get('/count', handlers.count);
router.post('/import', handlers.import);  // uses multer body-parser inside
router.use('/:locationId', locationIdParser, locationRouter);

module.exports = router;
