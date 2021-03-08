/* eslint-disable new-cap */

const router = require('express').Router();
const jsonParser = require('body-parser').json();

const handlers = require('./handlers');

// Geometry tools

router.get('/', jsonParser, handlers.getInEverySystem);

module.exports = router;
