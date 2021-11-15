
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');

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
      limit: Math.round(georap.config.tempUploadSizeLimit / (K * K)),
    }));

    var $uploadForm = $('#georap-import-upload-form');
    var $progress = $('#georap-import-progress');

    var $missingError = $('#georap-import-missingerror');
    var $otherError = $('#georap-import-othererror');
    var $sizeError = $('#georap-import-sizeerror');
    var $typeError = $('#georap-import-typeerror');

    $uploadForm.submit(function (ev) {
      ev.preventDefault();

      // Hide shown errors.
      ui.hide($missingError);
      ui.hide($otherError);
      ui.hide($sizeError);
      ui.hide($typeError);

      // Begin progress
      ui.show($progress);

      georap.stores.locations.importFile($uploadForm, function (err, result) {
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
        georap.go('/import/' + batchId);
      });
    });

  };

  this.unbind = function () {
    $('#georap-import-upload-form').off();
  };

};
