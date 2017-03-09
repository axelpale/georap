/* eslint-disable new-cap */

var handlers = require('./handlers');
var express = require('express');
var router = express.Router();

router.get('/', handlers.getAll);
router.get('/balances', handlers.getBalances);
router.get('/balances/:username', handlers.getBalance);
router.get('/users/:username', handlers.getAllOfUser);

module.exports = router;
