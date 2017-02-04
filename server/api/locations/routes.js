/* eslint-disable new-cap */

var handlers = require('./handlers');
var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();

// Locations

router.use('/:locationId', function (req, res, next) {
  // Converts string object id to ObjectId

  var stringId = req.params.locationId;

  try {
    req.locationId = new ObjectId(stringId);
  } catch (e) {
    return res.sendStatus(status.NOT_FOUND);
  }

  return next();
});

router.get('/:locationId', handlers.getOne);
router.post('/:locationId/attachments', handlers.addAttachment);

module.exports = router;
