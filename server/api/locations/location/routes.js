/* eslint-disable new-cap */

var express = require('express');
var router = express.Router();
var jsonParser = require('body-parser').json();
var handlers = require('./handlers');

var attachmentsRouter = require('./attachments/routes');
var storiesRouter = require('./stories/routes');
var visitsRouter = require('./visits/routes');

router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne);

router.post('/geom', jsonParser, handlers.changeGeom);
router.post('/name', jsonParser, handlers.changeName);
router.post('/tags', jsonParser, handlers.changeTags);

router.use('/attachments', attachmentsRouter);
router.use('/stories', storiesRouter);
router.use('/visits', visitsRouter);

module.exports = router;
