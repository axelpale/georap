/* eslint-disable new-cap */

var router = require('express').Router();
var usersRouter = require('./users/routes');

router.use('/users', usersRouter);

module.exports = router;
