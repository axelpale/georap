/* eslint-disable new-cap */

var entriesRouter = require('./entries/routes');
var handlers = require('./handlers');
var express = require('express');
var router = express.Router();
var jsonParser = require('body-parser').json();


router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne);

router.post('/geom', jsonParser, handlers.changeGeom);
router.post('/name', jsonParser, handlers.changeName);
router.post('/stars', jsonParser, handlers.changeStars);
router.post('/tags', jsonParser, handlers.changeTags);

router.use('/entries', entriesRouter);

module.exports = router;
