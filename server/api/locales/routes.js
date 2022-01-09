/* eslint-disable new-cap */

const router = require('express').Router();
const handlers = require('./handlers');

router.get('/', handlers.getAvailableLocales);
router.get('/:locale', handlers.getLocale);

module.exports = router;
