/* eslint-disable max-statements */

// Form for comment creation and edit
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var RemoveView = require('../Remove');
var ErrorView = require('../Error');
var template = require('./template.ejs');
var entryApi = tresdb.stores.entries;

module.exports = function (entry, comment) {
  // Parameters
  //   entry
  //     entry object
  //   comment
  //     comment object. The comment must be created.
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Short alias
  var entryId = entry._id;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    // Cancel button
    $elems.cancel = $mount.find('.comment-form-cancel');
    $elems.cancel.click(function () {
      self.emit('exit');
    });

    // Init error view
    $elems.error = $mount.find('.comment-form-error');
    children.error = new ErrorView();
    children.error.bind($elems.error);

    // Comment deletion button and form
    $elems.remove = $mount.find('.comment-remove-container');
    $elems.removeOpen = $mount.find('.comment-remove-open');
    $elems.removeOpen.click(function () {
      ui.toggleHidden($elems.remove);
    });

    children.remove = new RemoveView({
      info: 'This will delete the comment and its attachments if any.',
    });
    children.remove.bind($elems.remove);
    children.remove.on('submit', function () {
      entryApi.removeComment({
        entryId: entryId,
        commentId: comment.id,
      }, function (err) {
        if (err) {
          children.remove.reset(); // hide progress
          children.error.update(err.message);
          return;
        }
        // Global location_entry_comment_removed will cause unbind
        // and $mount removal.
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
