/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();
const jsonParser = require('body-parser').json();
const skipLimitParser = require('georap-middlewares').skipLimitParser;
const grable = require('georap-able');

const able = grable.able;
const ableOwn = grable.ableOwn;

router.get('/', handlers.getOne);

router.delete('/', ableOwn('locations-delete'), handlers.removeOne);

router.get('/attachments', handlers.getAttachments);

router.get('/posts', able('posts-read'),
           skipLimitParser, handlers.getEntries);

router.get('/events', able('locations-events'),
           skipLimitParser, handlers.getEvents);

router.post('/geom', ableOwn('locations-update'),
            jsonParser, handlers.changeGeom);

router.post('/name', ableOwn('locations-update'),
            jsonParser, handlers.changeName);

router.post('/tags', ableOwn('locations-update'),
            jsonParser, handlers.changeTags); // TODO remove
router.post('/status', ableOwn('locations-update'),
            jsonParser, handlers.changeStatus);
router.post('/type', ableOwn('locations-update'),
            jsonParser, handlers.changeType);

router.post('/thumbnail', ableOwn('locations-update'),
            jsonParser, handlers.changeThumbnail);

module.exports = router;
