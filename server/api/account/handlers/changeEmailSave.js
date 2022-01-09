const status = require('http-status-codes');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.params.key
  //   req.body.password
  //   req.body.verifyCode
  //
  return res.sendStatus(status.NOT_FOUND);
};
