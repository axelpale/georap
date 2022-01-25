var template = require('./template.ejs');
var headingTemplate = require('./heading.ejs');
var entryModel = require('georap-models').entry;
var AttachmentsView = require('./Attachments');
var CommentsView = require('./Comments');
var CommentForm = require('./CommentForm');
var CommentButton = require('./CommentButton');
var FormView = require('./Form');
var FormAdminView = require('./FormAdmin');
var flagstamp = require('./flagstamp');
var ui = require('georap-ui');
var account = georap.stores.account;
var ableOwn = account.ableOwn;
var able = account.able;
var locale = georap.i18n.locale;
var __ = georap.i18n.__;

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

  var ableUpdate = ableOwn(entry, 'posts-update');
  var ableMove = ableOwn(entry, 'posts-move');
  var ableDelete = ableOwn(entry, 'posts-delete');

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      ableUpdate: ableUpdate,
      ableDelete: ableDelete,
      enableFooter: able('comments-create'),
    }));

    // Heading text
    // NOTE form open button is rendered in the root template
    // to avoid button rebind if heading text changes.
    $elems.heading = $mount.find('.entry-heading');
    $elems.heading.html(headingTemplate({
      username: entry.user,
      flagstamp: flagstamp(entry.flags),
      timestamp: ui.timestamp(entry.time, locale), // locale for 'ago' trnsltn
      locationstamp: opts.displayLocation
        ? ui.locationstamp(entry.location) : null,
      __: __,
    }));

    // Markdown viewer
    $elems.markdown = $mount.find('.entry-body');
    if (entryModel.hasMarkdown(entry)) {
      $elems.markdown.html(ui.markdownToHtml(entry.markdown));
    } else {
      ui.hide($elems.markdown);
    }

    // Command all external links in markdown to open a new tab.
    // See http://stackoverflow.com/a/4425214/638546
    $elems.markdown.find('a').filter(function (i, elem) {
      return elem.hostname !== window.location.hostname;
    }).attr('target', '_blank');

    // Attachment viewer
    $elems.attachments = $mount.find('.entry-attachments-container');
    children.attachments = new AttachmentsView(entry, entry.attachments);
    children.attachments.bind($elems.attachments);

    // Comment list
    if (able('comments-read')) {
      children.comments = new CommentsView(entry);
      children.comments.bind($mount.find('.entry-comments-container'));
    }

    // Comment form
    if (able('comments-create')) {
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
    }

    // Post editing form
    if (ableUpdate || ableMove || ableDelete) {
      $elems.openBtn = $mount.find('.entry-form-open');
      $elems.openBtn.click(function () {
        var $formContainer = $mount.find('.entry-form-container');
        if (ui.isHidden($formContainer)) {
          ui.show($formContainer);

          if (ableUpdate) {
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
    // Refresh entry UI given an event.
    if ($mount) {
      // Update entry object
      entryModel.forward(entry, ev);
      // Update flags in heading
      $elems.heading.html(headingTemplate({
        username: entry.user,
        flagstamp: flagstamp(entry.flags),
        timestamp: ui.timestamp(entry.time, locale),
        locationstamp: opts.displayLocation
          ? ui.locationstamp(entry.location) : null,
        __: __,
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
