
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');

var K = 1024;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self);


  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      limit: Math.round(tresdb.config.tempUploadSizeLimit / (K * K)),
    }));

    var $uploadForm = $('#tresdb-import-upload-form');
    var $progress = $('#tresdb-import-progress');

    var $missingError = $('#tresdb-import-missingerror');
    var $otherError = $('#tresdb-import-othererror');
    var $sizeError = $('#tresdb-import-sizeerror');
    var $typeError = $('#tresdb-import-typeerror');

    $uploadForm.submit(function (ev) {
      ev.preventDefault();

      // Hide shown errors.
      ui.hide($missingError);
      ui.hide($otherError);
      ui.hide($sizeError);
      ui.hide($typeError);

      // Begin progress
      ui.show($progress);

      tresdb.stores.locations.importFile($uploadForm, function (err, result) {
        ui.hide($progress);

        if (err) {
          if (err.name === 'unknown filetype') {
            ui.show($typeError);
          } else if (err.name === 'no file given') {
            ui.show($missingError);
          } else {
            ui.show($otherError);
          }
          return;
        }

        // Import successful. Switch to batch page.
        var batchId = result.batchId;
        tresdb.go('/import/' + batchId);
      });
    });

  };

  this.unbind = function () {
    $('#tresdb-import-upload-form').off();
  };

};
