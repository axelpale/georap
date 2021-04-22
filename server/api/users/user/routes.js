/* eslint-disable new-cap */

const handlers = require('./handlers');
const express = require('express');
const router = express.Router();

// Single user

router.get('/', handlers.getOneWithEvents);
router.get('/payments', handlers.getOneWithBalanceAndPayments);
router.get('/visited', handlers.getVisitedLocationIds);
router.get('/flags', handlers.getFlags);

module.exports = router;
