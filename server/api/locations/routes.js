/* eslint-disable new-cap */

var handlers = require('./handlers');
var status = require('http-status-codes');
var ObjectId = require('mongodb').ObjectId;
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// Location collection

router.post('/', urlencodedParser, handlers.create);
router.get('/count', handlers.count);

// Single location

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
router.delete('/:locationId', handlers.removeOne);
router.post('/:locationId/name', urlencodedParser, handlers.changeName);
router.post('/:locationId/attachments', handlers.addAttachment);

module.exports = router;
