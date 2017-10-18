// Displays outcome of a batch import.
// - the number of imported and skipped locations
// - list of skipped locations
//   - reason: existing location too close
// - list of imported locations

var ListComp = require('../Batch/List');
var messageTemplate = require('./message.ejs');
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function (batchId) {
  // Parameters
  //   batchId
  //     string

  // Init
  var self = this;
  emitter(self);

  var listComp = new ListComp();

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      batchId: batchId,
    }));

    var $progress = $('#tresdb-outcome-progress');
    var $list = $('#tresdb-outcome-list');
    var $msg = $('#tresdb-outcome-message');

    listComp.bind($list);

    tresdb.stores.locations.getOutcome(batchId, function (err, result) {
      tresdb.ui.hide($progress);

      if (err) {
        console.error(err);
        return;
      }

      $msg.html(messageTemplate({
        createdLocs: result.created,
        skippedLocs: result.skipped,
      }));

      if (result.skipped.length > 0) {
        tresdb.ui.show($list);
      }

      listComp.setState({
        locs: result.skipped,
      });
    });
  };

  this.unbind = function () {
    listComp.unbind();
  };

};
