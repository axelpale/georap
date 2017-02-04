
// Data access layer
var dal = require('./dal');

var errors = require('../../errors');
var status = require('http-status-codes');

exports.getRecent = function (req, res) {
  // HTTP request handler

  // Page index
  var n = 20;
  var page = req.params.page ? req.params.page : 0;

  dal.getRecent(n, page, function (err, events) {
    if (err) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(errors.responses.DatabaseError);
    }
    return res.json(events);
  });
};
