/* eslint-disable new-cap */

const router = require('express').Router();
const usersRouter = require('./users/routes');
const testsRouter = require('./tests/routes');

router.use('/users', usersRouter);
router.use('/tests', testsRouter);

module.exports = router;
