var template = require('./template.ejs');
var CommentForm = require('../../CommentForm');
var Thumbnail = require('georap-components').Thumbnail;
var commentModel = require('georap-models').comment;
var isExpired = require('./isExpired');
var ui = require('georap-ui');
var account = georap.stores.account;
var ableOwn = account.ableOwn;
var locale = georap.i18n.locale;

module.exports = function (entry, comment) {
  // Parameters:
  //   entry
  //     entry object
  //   comment
  //     comment object
  //

  // Setup
  var self = this;
  var $elems = {};
  var children = {};
  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    // Do not allow comment to be edited if the comment is old
    var ableUpdate = ableOwn(comment, 'comments-update');
    var canUpdate = ableUpdate && !isExpired(comment);
    var canDelete = ableOwn(comment, 'comments-delete');

    $mount.html(template({
      author: comment.user,
      timestamp: ui.timestamp(comment.time, locale),
      canUpdate: canUpdate,
      canDelete: canDelete,
    }));

    // Message
    $elems.message = $mount.find('.comment-message');
    $elems.message.html(ui.markdownToHtml(comment.markdown));

    // Command all external links in markdown to open a new tab.
    // See http://stackoverflow.com/a/4425214/638546
    $elems.message.find('a').filter(function (i, elem) {
      return elem.hostname !== window.location.hostname;
    }).attr('target', '_blank');

    // Show attachment thumbnail
    $elems.thumb = $mount.find('.comment-attachment-thumbnail');
    if (comment.attachments.length > 0) {
      children.thumb = new Thumbnail(comment.attachments[0], {
        makeLink: true,
      });
      children.thumb.bind($elems.thumb);
    } else {
      ui.hide($elems.thumb);
    }

    if (canUpdate || canDelete) {
      $elems.form = $mount.find('.comment-form-container');
      $elems.open = $mount.find('.comment-edit-open');
      $elems.open.click(function () {
        if (children.form) {
          children.form.unbind();
          delete children.form;
          ui.hide($elems.form);
        } else {
          ui.show($elems.form);

          children.form = new CommentForm(entry, comment);
          children.form.bind($elems.form);

          children.form.once('cancel', function () {
            children.form.unbind();
            children.form.off(); // onces
            delete children.form;
            ui.hide($elems.form);
          });
          children.form.once('success', function () {
            children.form.unbind();
            children.form.off(); // onces
            delete children.form;
            ui.hide($elems.form);
          });
        }
      });
    }
  };

  self.update = function (ev) {
    // Parameters:
    //   ev
    //     a location_entry_comment_changed event
    //
    if ($mount) {
      commentModel.forward(comment, ev);
      // Refresh message
      $elems.message.html(ui.markdownToHtml(comment.markdown));
      // Refresh attachment
      if (children.thumb) {
        children.thumb.unbind();
        delete children.thumb;
        ui.hide($elems.thumb);
      }
      if (comment.attachments.length > 0) {
        children.thumb = new Thumbnail(comment.attachments[0], {
          makeLink: true,
        });
        children.thumb.bind($elems.thumb);
        ui.show($elems.thumb);
      }
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.offAll(children);
      ui.unbindAll(children);
      children = {};
    }
  };
};
