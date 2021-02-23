var template = require('./template.ejs');
var commentModel = require('tresdb-models').comment;
var ui = require('tresdb-ui');
var account = tresdb.stores.account;

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     entry object
  //   comment
  //     comment object
  //

  this.bind = function ($mount) {
    var isAuthor = account.isMe(comment.user);
    var isAdmin = account.isAdmin();
    var isAuthorOrAdmin = (isAuthor || isAdmin);

    $mount.html(template({
      author: comment.user,
      htmlMessage: ui.markdownToHtml(comment.markdown),
      timestamp: ui.timestamp(comment.time),
      isAuthor: isAuthor,
      isFresh: commentModel.isFresh(comment),
      isAuthorOrAdmin: isAuthorOrAdmin,
    }));
  };

  this.unbind = function () {
  };
};
