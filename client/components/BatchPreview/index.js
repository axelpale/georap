
var messageTemplate = require('./message.ejs');
var template = require('./template.ejs');
var ListComp = require('./List');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var __ = georap.i18n.__;

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
      __: __,
    }));

    var $progress = $('#georap-batch-progress');
    var $list = $('#georap-batch-list');
    var $error = $('#georap-batch-error');
    var $error404 = $('#georap-batch-error404');
    var $message = $('#georap-batch-message');

    var $cancel = $('#georap-batch-cancel');
    var $submitSelected = $('#georap-batch-import-selected');
    var $submitAllButton = $('#georap-batch-import-all');
    var $submitAllForm = $('#georap-batch-form');

    listComp.bind($list);

    var updateCounts = function () {
      var a = listComp.countSelected().toString(DEC);
      var b = listComp.countLocations().toString(DEC);
      $submitSelected.html(__('import-selected') + ' (' + a + ')');
      $submitAllButton.html(__('import-all') + ' (' + b + ')');
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

      $message.html(messageTemplate({
        locs: locs,
        __: __,
      }));

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
    $('#georap-batch-form').off();
    $('#georap-batch-import-selected').off();
  };

};
