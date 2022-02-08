// Displays outcome of a batch import.
// - the number of imported and skipped locations
// - the number of overlapping entries and number of merged entries.
// - list of created or modified locations

var messageTemplate = require('./message.ejs');
var listTemplate = require('./list.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');

module.exports = function (batchId) {
  // Parameters
  //   batchId
  //     string

  // Init
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      batchId: batchId,
      __: georap.i18n.__,
    }));

    var $progress = $('#georap-outcome-progress');
    var $list = $('#georap-outcome-list');
    var $msg = $('#georap-outcome-message');

    georap.stores.locations.getOutcome(batchId, function (err, result) {
      // Progress bar is visible by default
      ui.hide($progress);

      if (err) {
        console.error(err);
        return;
      }

      // Message about the results
      var totalNum = result.created.length + result.modified.length +
        result.skipped.length;

      $msg.html(messageTemplate({
        createdNum: result.created.length,
        modifiedNum: result.modified.length,
        skippedNum: result.skipped.length,
        totalNum: totalNum,
        __: georap.i18n.__,
      }));

      $list.html(listTemplate({
        createdLocs: result.created,
        modifiedLocs: result.modified,
        skippedLocs: result.skipped,
        __: georap.i18n.__,
      }));

      ui.show($list);
    });
  };

  this.unbind = function () {
  };

};
