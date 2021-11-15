
var messageTemplate = require('./message.ejs');
var template = require('./template.ejs');
var ListComp = require('./List');
var emitter = require('component-emitter');
var ui = require('georap-ui');

var DEC = 10;

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
    var $error = $('#tresdb-batch-error');
    var $error404 = $('#tresdb-batch-error404');
    var $message = $('#tresdb-batch-message');

    var $cancel = $('#tresdb-batch-cancel');
    var $submitSelected = $('#tresdb-batch-import-selected');
    var $submitAllButton = $('#tresdb-batch-import-all');
    var $submitAllForm = $('#tresdb-batch-form');

    listComp.bind($list);

    var updateCounts = function () {
      var a = listComp.countSelected();
      var b = listComp.countLocations();
      $submitSelected.html('Import selected (' + a.toString(DEC) + ')');
      $submitAllButton.html('Import all (' + b.toString(DEC) + ')');
    };

    listComp.on('changed', function () {
      updateCounts();
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      // Close
      georap.go('/');
    });

    georap.stores.locations.getBatch(batchId, function (err, locs) {
      ui.hide($progress);

      if (err) {
        if (err.message === 'Not Found') {
          ui.show($error404);
          return;
        }
        console.log('getBatch');
        console.error(err);
        return;
      }

      $message.html(messageTemplate({ locs: locs }));

      ui.show($list);
      ui.show($submitAllForm);
      listComp.setState({
        locs: locs,
      });

      // Enable form buttons now when the locations have loaded.
      $submitAllForm.find('button').removeClass('disabled');

      var handleSubmit = function (indices) {
        // Begin import
        ui.show($progress);
        ui.hide($submitAllForm);

        georap.stores.locations.importBatch({
          batchId: batchId,
          indices: indices,
        }, function (errs) {
          ui.hide($progress);

          if (errs) {
            console.error(errs);
            $error.children().first().text(errs.message);
            ui.show($error);
            return;
          }

          // Import success, go to results
          georap.go('/import/' + batchId + '/outcome');
        });
      };

      // Ready to submit
      $submitSelected.click(function (evv) {
        evv.preventDefault();
        // Prevent double import
        $submitSelected.off();

        var indices = listComp.getSelectedIndices();

        return handleSubmit(indices);
      });

      $submitAllForm.submit(function (evv) {
        evv.preventDefault();
        // Prevent double submit
        $submitAllForm.off();

        // Import all indices;
        var indices = locs.map(function (l, index) {
          return index;
        });

        return handleSubmit(indices);
      });

    });

  };

  this.unbind = function () {
    listComp.unbind();
    $('#tresdb-batch-form').off();
    $('#tresdb-batch-import-selected').off();
  };

};
