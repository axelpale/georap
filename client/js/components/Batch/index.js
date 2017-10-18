
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
    var $submitSelected = $('#tresdb-batch-import-selected');
    var $submitAllButton = $('#tresdb-batch-import-all');
    var $submitAllForm = $('#tresdb-batch-form');

    listComp.bind($list);

    var updateCounts = function () {
      var a = listComp.countSelected();
      var b = listComp.countLocations();
      $submitSelected.html('Import selected (' + a.toString(10) + ')');
      $submitAllButton.html('Import all (' + b.toString(10) + ')');
    };

    listComp.on('changed', function () {
      updateCounts();
    });

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

        // remove jQuery methods
        // var rawIndices = indices.filter(function (i) {
        //   return typeof i === 'number';
        // });
        // console.log(rawIndices);
        // return;

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
    $('#tresdb-batch-import-selected').off();
  };

};
