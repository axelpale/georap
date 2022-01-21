/* eslint-disable new-cap */

const express = require('express');
const router = express.Router();

const handlers = require('./handlers');
const able = require('georap-able').middleware;
const commentPreloader = require('./lib/commentPreloader');
const jsonParser = require('body-parser').json();

router.post('/', able('comments-create'), jsonParser, handlers.create);

router.use('/:commentId', commentPreloader);

router.post('/:commentId', able('comments-create'),
            jsonParser, handlers.change);
// Deletion has internal permission handling
router.delete('/:commentId', jsonParser, handlers.remove);

module.exports = router;
