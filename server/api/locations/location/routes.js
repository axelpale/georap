/* eslint-disable new-cap */

const able = require('georap-able').middleware;
const handlers = require('./handlers');
const express = require('express');
const router = express.Router();
const jsonParser = require('body-parser').json();
const middlewares = require('georap-middlewares');

router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne); // Internal remove rule checking

router.get('/attachments', handlers.getAttachments);

router.post('/geom', able('locations-update'),
            jsonParser, handlers.changeGeom);

router.get('/entries', middlewares.skipLimitParser, handlers.getEntries);

router.get('/events', able('locations-events'), middlewares.skipLimitParser,
           handlers.getEvents);

router.post('/name', able('locations-update'),
            jsonParser, handlers.changeName);

router.post('/tags', able('locations-update'),
            jsonParser, handlers.changeTags); // TODO remove
router.post('/status', able('locations-update'),
            jsonParser, handlers.changeStatus);
router.post('/type', able('locations-update'),
            jsonParser, handlers.changeType);

router.post('/thumbnail', able('locations-update'),
            jsonParser, handlers.changeThumbnail);

module.exports = router;
