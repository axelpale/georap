const status = require('http-status-codes');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body.email
  //
  return res.sendStatus(status.NOT_FOUND);
};
