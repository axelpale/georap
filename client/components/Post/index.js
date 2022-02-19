/* eslint-disable max-statements */
var template = require('./template.ejs');
var headingTemplate = require('./heading.ejs');
var postModel = require('georap-models').entry;
var AttachmentsView = require('./Attachments');
var CommentsView = require('./Comments');
var CommentForm = require('./CommentForm');
var CommentButton = require('./CommentButton');
var FormView = require('./Form');
var flagstamp = require('./flagstamp');
var ui = require('georap-ui');
var components = require('georap-components');
var Opener = components.Opener;
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
    if (postModel.hasMarkdown(entry)) {
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
      $elems.commentForm = $mount.find('.comment-creation-form');
      children.commentButton = new CommentButton();
      children.commentButton.bind($mount.find('.comment-button-container'));
      children.commentButton.on('open', function () {
        ui.hide($elems.footer);
        ui.show($elems.commentForm);
        children.commentForm = new CommentForm(entry);
        children.commentForm.bind($elems.commentForm);

        // React to cancel button
        children.commentForm.once('cancel', function () {
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
      var formView = new FormView(entry.locationId, entry);
      children.editform = new Opener(formView);
      children.editform.bind({
        $container: $mount.find('.entry-form-container'),
        $button: $mount.find('.entry-form-open'),
      });
      children.editform.on('success', function () {
        children.editform.close();
      });
    }
  };

  this.update = function (ev) {
    // Refresh entry UI given an event.
    if ($mount) {
      // Update entry object
      postModel.forward(entry, ev);
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
      if (postModel.hasMarkdown(entry)) {
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
