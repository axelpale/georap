/* eslint-disable new-cap */

const handlers = require('./handlers');
const router = require('express').Router();

router.get('/throw-error', handlers.throwError);
router.get('/next-error', handlers.nextError);

module.exports = router;
