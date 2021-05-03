/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();
const jsonParser = require('body-parser').json();
const middlewares = require('georap-middlewares');

router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne);

router.get('/attachments', handlers.getAttachments);
router.post('/geom', jsonParser, handlers.changeGeom);
router.get('/entries', middlewares.skipLimitParser, handlers.getEntries);
router.post('/name', jsonParser, handlers.changeName);
router.post('/tags', jsonParser, handlers.changeTags); // TODO remove
router.post('/status', jsonParser, handlers.changeStatus);
router.post('/type', jsonParser, handlers.changeType);
router.post('/thumbnail', jsonParser, handlers.changeThumbnail);

module.exports = router;
