// Payments Management UI

var template = require('./template.ejs');
var Balances = require('./Balances');
var PaymentsHistory = require('./History');
var Registration = require('./Registration');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  var balancesComp;
  var paymentsHistoryComp;
  var registrationComp;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template());


    balancesComp = new Balances();
    balancesComp.bind($('#georap-balances-root'));

    paymentsHistoryComp = new PaymentsHistory();
    paymentsHistoryComp.bind($('#georap-history-root'));

    registrationComp = new Registration();
    registrationComp.bind($('#georap-registration-root'));
  };

  this.unbind = function () {

    if (balancesComp) {
      balancesComp.unbind();
    }

    if (paymentsHistoryComp) {
      paymentsHistoryComp.unbind();
    }

    if (registrationComp) {
      registrationComp.unbind();
    }
  };

};
