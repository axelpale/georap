// Form for comment creation and edit
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var updateHint = require('./updateHint');
var template = require('./template.ejs');

// var MIN_LEN = tresdb.config.comments.minMessageLength;
// var MAX_LEN = tresdb.config.comments.maxMessageLength;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
    }));

    $elems.cancel = $mount.find('.comment-form-cancel');
    $elems.cancel.click(function () {
      self.emit('exit');
    });

    // Focus to message
    $elems.message = $mount.find('.comment-form-message');
    $elems.message.focus();

    // Setup hint
    $elems.hint = $mount.find('.comment-form-hint');
    var handleHint = function () {
      var len = $elems.message.val().length;
      updateHint($elems.hint, len);
    };
    handleHint(); // init
    $elems.message.on('input', handleHint); // on text input
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
