/* eslint-disable new-cap */

const entriesRouter = require('../../entries/routes');
const handlers = require('./handlers');
const express = require('express');
const router = express.Router();
const jsonParser = require('body-parser').json();

router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne);

router.post('/geom', jsonParser, handlers.changeGeom);
router.post('/name', jsonParser, handlers.changeName);
router.post('/tags', jsonParser, handlers.changeTags); // TODO remove
router.post('/status', jsonParser, handlers.changeStatus);
router.post('/type', jsonParser, handlers.changeType);
router.post('/thumbnail', jsonParser, handlers.changeThumbnail);

router.use('/entries', entriesRouter);

module.exports = router;
