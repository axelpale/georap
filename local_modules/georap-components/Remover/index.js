
var Opener = require('../Opener');
var RemoverPanel = require('./RemoverPanel');
var ui = require('georap-ui');
var emitter = require('component-emitter');

module.exports = function (params) {
  // Removal button and confirmation.
  //
  // Parameters:
  //   params, with required props
  //     cancelBtnText
  //       string
  //     deleteBtnText
  //       string
  //     infoText
  //       string
  //     youSureText
  //       string
  //
  // Emit
  //   submit
  //     on confirmed deletion attempt
  //
  var $container = null;
  var $button = null;
  var opener = null;
  var self = this;
  emitter(self);

  self.bind = function (mounts) {
    $container = mounts.$container;
    $button = mounts.$button;

    var panel = new RemoverPanel({
      cancelBtnText: params.cancelBtnText,
      deleteBtnText: params.deleteBtnText,
      infoText: params.infoText,
      youSureText: params.youSureText,
    });
    opener = new Opener(panel, false);
    opener.bind({
      $container: $container,
      $button: $button,
    });

    // Forward RemoverPanel submit
    opener.on('submit', function (ev) {
      if (ev) {
        ev.preventDefault(); // in case of submit button event is passed
      }
      self.emit('submit', ev);
    });
  };

  self.close = function () {
    // Close the panel and button states
    if (opener) {
      opener.close();
    }
  };

  self.unbind = function () {
    if (opener) {
      opener.off('submit');
      opener.unbind();
      opener = null;
      $container = null;
      $button = null;
    }
  };
};
