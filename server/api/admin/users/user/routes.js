/* eslint-disable new-cap */

const handlers = require('./handlers');
const router = require('express').Router();
const jsonParser = require('body-parser').json();

router.get('/', handlers.getOne);
router.delete('/', handlers.removeOne);
router.post('/role', jsonParser, handlers.setRole);

module.exports = router;
