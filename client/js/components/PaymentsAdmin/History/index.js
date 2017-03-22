// Payment history table

var payments = require('../../../stores/payments');
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');

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

    var $progress = $('#tresdb-history-progress');
    var $tablecont = $('#tresdb-history-container');
    var $error = $('#tresdb-history-error');

    payments.getAll(function (err, ps) {
      hide($progress);

      if (err) {
        return show($error);
      }

      $tablecont.html(tableTemplate({
        payments: ps,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
