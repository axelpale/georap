/* eslint-disable max-statements */
// module EntryForm
//
// Features
// - use same form for entry creation and edit.
// - handles the API calls internally
// - is able to upload attachments
// - temporary store of content for interrupted creation or edit
//
var template = require('./template.ejs');
var EditForm = require('./EditForm');
var ErrorView = require('../Error');
var MoveForm = require('./MoveForm');
var ui = require('georap-ui');
var emitter = require('component-emitter');
var components = require('georap-components');
var Opener = components.Opener;
var Remover = components.Remover;
var entries = georap.stores.entries;
var account = georap.stores.account;
var ableOwn = account.ableOwn;
var __ = georap.i18n.__;

module.exports = function (locationId, entry) {
  // Entry form View.
  //
  // Parameters:
  //   locationId
  //     location id string
  //   entry
  //     optional entry object. If not given, a blank entry form is shown.
  //
  var isNew = false;
  if (!entry) {
    isNew = true;
  }

  var $mount = null;
  var $elems = {};
  var children = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var ableUpdate = ableOwn(entry, 'posts-update');
    var ableMove = ableOwn(entry, 'posts-move');
    var ableDelete = ableOwn(entry, 'posts-delete');

    $mount.html(template({
      isNew: isNew,
      ableUpdate: ableUpdate,
      ableMove: ableMove,
      ableDelete: ableDelete,
      __: __,
    }));

    // Error viewer
    children.error = new ErrorView();
    children.error.bind($mount.find('.form-error-container'));
    // Progress bar
    $elems.progress = $mount.find('.form-progress');

    // Edit form
    if (ableUpdate) {
      children.edit = new EditForm(locationId, entry);
      children.edit.bind($mount.find('.entry-edit-form'));

      // Save button
      $elems.saveBtn = $mount.find('.entry-form-save');
      $elems.saveBtn.click(function () {
        // Create new entry or update the existing

        // Prevent double click
        $elems.saveBtn.attr('disabled', 'disabled');

        var entryData = children.edit.getEntryData();

        var onError = function (msg) {
          // Hide progress bar
          ui.hide($elems.progress);
          // Show alert
          children.error.update(msg);
          // Enable save
          $elems.saveBtn.removeAttr('disabled');
        };

        var onSuccess = function () {
          // Hide progress bar
          ui.hide($elems.progress);
          // Inform parents
          self.emit('success');
        };

        // Ensure non-empty content
        if (entryData.markdown.length + entryData.attachments.length === 0) {
          return onError(__('empty-post-error'));
        }

        // Display progress bar
        ui.show($elems.progress);

        if (isNew) {
          entries.create(locationId, entryData, function (err) {
            if (err) {
              if (!err.message) {
                return onError('Failed to send. Check connection.');
              }
              return onError(err.message);
            }
            // End drafting and clear stored draft.
            // Do it here instead of onSuccess handler to prevent
            // an entry change clearing the new draft.
            children.edit.discardDraft();
            // Stuff to do after either creation or change
            onSuccess();
          });
        } else {
          entries.change(locationId, entry._id, entryData, function (err) {
            if (err) {
              if (!err.message) {
                return onError('Failed to save. Check connection.');
              }
              return onError(err.message);
            }
            onSuccess();
          });
        }
      });
    }

    if (!isNew) {
      if (ableDelete) {
        children.remover = new Remover({
          cancelBtnText: __('cancel'),
          deleteBtnText: __('delete-ok'),
          infoText: __('post-removal-info'),
          youSureText: __('are-you-sure-cannot-undo'),
        });
        children.remover.bind({
          $container: $mount.find('.entry-remove-container'),
          $button: $mount.find('.entry-remove-open'),
        });
        children.remover.on('submit', function () {
          entries.remove(entry.locationId, entry._id, function (err) {
            if (err) {
              children.remover.close(); // hide progress and confirmation
              children.error.update(err.message);
              return;
            }
            // Success. The server will emit location_entry_removed
            self.emit('finish');
          });
        });
      }

      if (ableMove) {
        var moveForm = new MoveForm(entry);
        children.mover = new Opener(moveForm);
        children.mover.bind({
          $container: $mount.find('.entry-move-container'),
          $button: $mount.find('.entry-move-open'),
        });
      }

      // Cancel button to close the edit form
      $elems.cancelBtn = $mount.find('.entry-form-cancel');
      $elems.cancelBtn.click(function () {
        self.emit('cancel');
      });
    }
  };

  self.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
      $mount = null;
    }
  };
};
