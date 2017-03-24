var dal = require('./dal');
var status = require('http-status-codes');

exports.getAll = function (req, res) {

  dal.getAll(function (err, data) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(data);
  });
};
