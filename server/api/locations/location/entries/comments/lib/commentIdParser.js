// URL parser middleware

var status = require('http-status-codes');

var validPattern = /^\d{20,30}$/;

module.exports = function (req, res, next) {
  var stringId = req.params.commentId;

  if (validPattern.test(stringId)) {
    req.commentId = stringId;
    return next();
  }

  // Else
  return res.sendStatus(status.NOT_FOUND);
};
