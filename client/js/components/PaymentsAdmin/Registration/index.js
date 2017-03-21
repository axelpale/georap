// Payment history table

var payments = require('../../../stores/payments');
var template = require('./template.ejs');
var emitter = require('component-emitter');

var isHidden = function ($el) {
  return $el.hasClass('hidden');
};

var show = function ($el) {
  $el.removeClass('hidden');
};

var hide = function ($el) {
  $el.addClass('hidden');
};

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    // Template with loading bar
    $mount.html(template());

    var $open = $('#tresdb-registration-open');
    var $cancel = $('#tresdb-registration-cancel');
    var $form = $('#tresdb-registration-form');
    var $progress = $('#tresdb-registration-progress');
    var $success = $('#tresdb-registration-success');
    var $successClose = $('#tresdb-registration-success button');
    var $error = $('#tresdb-registration-error');

    $open.click(function (ev) {
      ev.preventDefault();

      if (isHidden($form)) {
        show($form);
        hide($error);
      } else {
        hide($form);
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();

      hide($form);
    });

    $successClose.click(function (ev) {
      ev.preventDefault();

      hide($success);
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      hide($form);
      show($progress);

      payments.create(function (err) {
        hide($progress);

        if (err) {
          show($error);
          return;
        }

        show($success);
      });
    });
  };

  this.unbind = function () {
    // noop
  };

};
