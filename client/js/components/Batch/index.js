
var template = require('./template.ejs');
var ListComp = require('./List');
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

    var $progress = $('#tresdb-batch-progress');
    var $list = $('#tresdb-batch-list');

    var $cancel = $('#tresdb-batch-cancel');
    var $submitSelected = $('#tresdb-batch-selected');
    var $submitAllForm = $('#tresdb-batch-form');

    listComp.bind($list);

    $cancel.click(function (ev) {
      ev.preventDefault();
      // Close
      tresdb.go('/');
    });

    tresdb.stores.locations.getBatch(batchId, function (err, result) {
      if (err) {
        console.log('getBatch');
        console.error(err);
        return;
      }

      var locs = result;

      tresdb.ui.hide($progress);
      tresdb.ui.show($list);

      listComp.setState({
        locs: locs,
      });

      // Enable form buttons now when the locations have loaded.
      $submitAllForm.find('button').removeClass('disabled');

      // Ready to submit
      $submitSelected.click(function (evv) {
        evv.preventDefault();

        // Prevent double import
        $submitSelected.off();

        var indices = listComp.getSelectedIndices();

        tresdb.stores.locations.importBatch({
          batchId: batchId,
          indices: indices,
        }, function (errs) {
          if (errs) {
            console.error(errs);
          }
        });
      });

      $submitAllForm.submit(function (evv) {
        evv.preventDefault();

        // Prevent double submit
        $submitAllForm.off();

        // Import all indices;
        var indices = locs.map(function (l, index) {
          return index;
        });

        tresdb.stores.locations.importBatch({
          batchId: batchId,
          indices: indices,
        }, function (errs, response) {
          if (errs) {
            console.error(errs);
          }

          console.log('success', response);
        });
      });

    });

  };

  this.unbind = function () {
    listComp.unbind();
    $('#tresdb-batch-form').off();
    $('#tresdb-batch-selected').off();
  };

};
