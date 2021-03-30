// URL parser middleware

var status = require('http-status-codes');

var validPattern = /^\d{20,30}$/;

module.exports = function (req, res, next) {
  var stringId = req.params.commentId;

  if (validPattern.test(stringId)) {
    req.commentId = stringId;
  } else {
    return res.sendStatus(status.NOT_FOUND);
  }

  var comments = req.entry.comments;

  if (comments) {
    var comment = comments.find(function (co) {
      return co.id === req.commentId;
    });
    if (comment) {
      req.comment = comment;
      return next();
    }
  }

  return res.sendStatus(status.NOT_FOUND);
};
