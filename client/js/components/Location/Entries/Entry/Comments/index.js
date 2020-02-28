var template = require('./template.ejs');
var CommentView = require('./Comment');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var _commentViewsMap = {};

  // Public methods

  this.bind = function ($mount) {
    var comments = entry.getComments();

    $mount.html(template());
    var $commentsEl = $mount.children().first();

    comments.forEach(function (comment) {
      var commentId = comment.id;
      var v = new CommentView(comment);

      _commentViewsMap[commentId] = v;

      $commentsEl.append('<div id="comment-' + commentId + '"></div>');
      v.bind($('#comment-' + commentId));
    });
  };

  this.unbind = function () {
    // Unbind each child
    var k, v;
    for (k in _commentViewsMap) {
      if (_commentViewsMap.hasOwnProperty(k)) {
        v = _commentViewsMap[k];
        v.unbind();
      }
    }
  };
};
