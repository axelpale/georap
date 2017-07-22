/* eslint-disable new-cap */

var router = require('express').Router();
var handlers = require('./handlers');
var userRouter = require('./user/routes');

router.get('/', handlers.get);

router.use('/:username', userRouter);

module.exports = router;
