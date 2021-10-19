/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');

// Geometry tools

router.post('/', jsonParser, handlers.getInEverySystem);
router.get('/parse', handlers.parseCoordinates);

module.exports = router;
