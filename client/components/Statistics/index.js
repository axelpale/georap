
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var statisticsApi = georap.stores.statistics;
var __ = georap.i18n.__;

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template({
      __: __,
    }));

    var $error = $('#georap-statistics-error');
    var $progress = $('#georap-statistics-progress');
    var $table = $('#georap-statistics-table');

    statisticsApi.getAll(function (err, stats) {
      ui.hide($progress);

      if (err) {
        ui.show($error);
        return;
      }

      // Add current client version.
      // A dev can compare this to serverVersion.
      stats.clientVersion = georap.version;

      $table.html(tableTemplate({
        stats: stats,
        __: __,
      }));
    });

  };

  this.unbind = function () {
    // noop
  };

};
