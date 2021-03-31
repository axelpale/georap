var template = require('./template.ejs');
var emitter = require('component-emitter');
var CommentView = require('./Comment');
var CommentForm = require('./Form');
var ui = require('tresdb-ui');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     entry object
  //

  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Helper methods

  var buildComment = function (comment) {
    // Generate comment view and element for a comment object.
    var commentId = comment.id;
    var v = new CommentView(entry, comment);

    children[commentId] = v;

    var commentEl = document.createElement('div');
    commentEl.id = 'comment-' + commentId;

    var $commentEl = $(commentEl);
    v.bind($commentEl);

    return $commentEl;
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      entryId: entry._id,
    }));

    // Render comments
    $elems.comments = $mount.find('.entry-comments');
    entry.comments.forEach(function (comment) {
      var $comment = buildComment(comment);
      $elems.comments.append($comment);
    });

    // Setup comment form
    $elems.footer = $mount.find('.entry-footer');
    $elems.form = $mount.find('.comment-form-container');
    $elems.open = $mount.find('.comment-form-open');
    $elems.open.click(function () {
      ui.hide($elems.footer);
      ui.show($elems.form);
      children.form = new CommentForm();
      children.form.bind($elems.form);

      // React to cancel button
      children.form.once('exit', function () {
        ui.show($elems.footer);
        ui.hide($elems.form); // contents could be removed?
        children.form.unbind();
        delete children.form;
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
