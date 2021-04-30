var template = require('./template.ejs');
var headingTemplate = require('./heading.ejs');
var entryModel = require('georap-models').entry;
var AttachmentsView = require('./Attachments');
var CommentsView = require('./Comments');
var CommentForm = require('./CommentForm');
var CommentButton = require('./CommentButton');
var FormView = require('./Form');
var FormAdminView = require('./FormAdmin');
var ui = require('georap-ui');
var account = tresdb.stores.account;

module.exports = function (entry, opts) {
  // Parameters:
  //   entry
  //     entry object
  //   opts
  //     displayLocation
  //       show location name in the entry heading. Default false.
  //       If true, the entry object must contain joined 'location' property.
  //
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    displayLocation: false,
  }, opts);

  var $mount = null;
  var $elems = {};
  var children = {};

  var isAuthor = account.isMe(entry.user);
  var isAdmin = account.isAdmin();
  var isAuthorOrAdmin = (isAuthor || isAdmin);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      isAuthorOrAdmin: isAuthorOrAdmin,
    }));

    // Heading text
    // NOTE form open button is rendered in the root template
    // to avoid button rebind if heading text changes.
    $elems.heading = $mount.find('.entry-heading');
    $elems.heading.html(headingTemplate({
      username: entry.user,
      flagstamp: ui.flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time),
      locationstamp: opts.displayLocation
        ? ui.locationstamp(entry.location) : null,
    }));

    // Markdown viewer
    $elems.markdown = $mount.find('.entry-body');
    if (entryModel.hasMarkdown(entry)) {
      $elems.markdown.html(ui.markdownToHtml(entry.markdown));
    } else {
      ui.hide($elems.markdown);
    }

    // Attachment viewer
    $elems.attachments = $mount.find('.entry-attachments-container');
    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($elems.attachments);

    // Comment list
    children.comments = new CommentsView(entry);
    children.comments.bind($mount.find('.entry-comments-container'));

    // Comment form
    $elems.footer = $mount.find('.entry-footer');
    $elems.commentForm = $mount.find('.comment-form-container');
    children.commentButton = new CommentButton();
    children.commentButton.bind($mount.find('.comment-button-container'));
    children.commentButton.on('open', function () {
      ui.hide($elems.footer);
      ui.show($elems.commentForm);
      children.commentForm = new CommentForm(entry);
      children.commentForm.bind($elems.commentForm);

      // React to cancel button
      children.commentForm.once('exit', function () {
        ui.show($elems.footer);
        ui.hide($elems.commentForm);
        children.commentForm.unbind();
        delete children.commentForm;
      });
      // React to successful form submission
      children.commentForm.once('success', function () {
        ui.show($elems.footer);
        ui.hide($elems.commentForm);
        children.commentForm.unbind();
        delete children.commentForm;
      });
    });

    if (isAuthorOrAdmin) {
      $elems.openBtn = $mount.find('.entry-form-open');
      $elems.openBtn.click(function () {
        var $formContainer = $mount.find('.entry-form-container');
        if (ui.isHidden($formContainer)) {
          ui.show($formContainer);

          if (isAuthor) {
            children.editform = new FormView(entry.locationId, entry);
            children.editform.bind($formContainer);
          } else {
            // The user is non-author admin. Show reduced form.
            children.editform = new FormAdminView(entry.locationId, entry);
            children.editform.bind($formContainer);
          }

          children.editform.once('exit', function () {
            // Close the form if entry not already unbound.
            // For example entry removal might remove the entry view before
            // form exits.
            if ($mount) {
              ui.hide($formContainer);
              children.editform.unbind();
              children.editform.off(); // for once
              delete children.editform;
            }
          });
          children.editform.once('success', function () {
            if ($mount) {
              ui.hide($formContainer);
              children.editform.unbind();
              children.editform.off(); // for once
              delete children.editform;
            }
          });
        } else {
          ui.hide($formContainer);
          children.editform.unbind();
          children.editform.off(); // for once
          delete children.editform;
        }
      });
    }
  };

  this.update = function (ev) {
    if ($mount) {
      // Update entry object
      entryModel.forward(entry, ev);
      // Update flags in heading
      $elems.heading.html(headingTemplate({
        username: entry.user,
        flagstamp: ui.flagstamp(entry.flags),
        timestamp: ui.timestamp(entry.time),
        locationstamp: opts.displayLocation
          ? ui.locationstamp(entry.location) : null,
      }));
      // Update markdown
      if (entryModel.hasMarkdown(entry)) {
        $elems.markdown.html(ui.markdownToHtml(entry.markdown));
      } else {
        $elems.markdown.empty();
        ui.hide($elems.markdown);
      }
      // Update attachments
      children.attachments.unbind();
      children.attachments = new AttachmentsView(entry, entry.attachments);
      children.attachments.bind($elems.attachments);
    }
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
    }
  };
};
