// URL parser middleware

const status = require('http-status-codes');

const validPattern = /^\d{20,30}$/;

module.exports = function (req, res, next) {
  const stringId = req.params.commentId;

  if (validPattern.test(stringId)) {
    req.commentId = stringId;
  } else {
    return res.sendStatus(status.NOT_FOUND);
  }

  const comments = req.entry.comments;

  if (comments) {
    const comment = comments.find((co) => {
      return co.id === req.commentId;
    });
    if (comment) {
      req.comment = comment;

      // Mark ownership for capability checking
      if (req.user && req.user.name === comment.user) {
        req.isOwner = true;
      } else {
        // Post might be owned but not the comment.
        // Thus override if already set.
        req.isOwner = false;
      }

      return next();
    }
  }

  return res.sendStatus(status.NOT_FOUND);
};
