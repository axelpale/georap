// Payments Management UI

var template = require('./template.ejs');
var Balances = require('./Balances');
var PaymentsHistory = require('./History');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  var balancesComp;
  var historyComp;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template());

    balancesComp = new Balances();
    balancesComp.bind($('#tresdb-balances-root'));

    historyComp = new PaymentsHistory();
    historyComp.bind($('#tresdb-history-root'));

  };

  this.unbind = function () {

    if (balancesComp) {
      balancesComp.unbind();
    }

    if (historyComp) {
      historyComp.unbind();
    }
  };

};
