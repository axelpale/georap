
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');

module.exports = function (opts) {
  // Removal button and confirmation.
  //
  // Parameters:
  //   opts, with optional props
  //     info
  //       string
  //
  // Emit
  //   submit
  //     on confirmed deletion attempt

  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    info: 'Delete',
  }, opts);

  var $mount = null;
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      info: opts.info,
      __: georap.i18n.__,
    }));

    $elems.confirmation = $mount.find('.form-remove-confirmation');
    $elems.progress = $mount.find('.form-remove-progress');

    $elems.cancelBtn = $mount.find('button.form-cancel-btn');
    $elems.cancelBtn.click(function () {
      self.emit('cancel');
    });

    $elems.removeBtn = $mount.find('button.form-remove-btn');
    $elems.removeBtn.click(function () {
      ui.hide($elems.confirmation);
      ui.show($elems.progress);
      self.emit('submit');
    });
  };

  self.reset = function () {
    if ($mount) {
      ui.hide($elems.confirmation);
      ui.hide($elems.progress);
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
    }
  };
};
