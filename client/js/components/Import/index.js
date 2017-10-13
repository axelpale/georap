
var template = require('./template.ejs');
var emitter = require('component-emitter');

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
      limit: Math.round(tresdb.config.uploadSizeLimit / (K * K)),
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
      tresdb.ui.hide($missingError);
      tresdb.ui.hide($otherError);
      tresdb.ui.hide($sizeError);
      tresdb.ui.hide($typeError);

      // Begin progress
      tresdb.ui.show($progress);

      tresdb.stores.locations.importFile($uploadForm, function (err, result) {

        var batchId = result.batchId;

        tresdb.ui.hide($progress);

        if (err) {
          if (err.name === 'unknown filetype') {
            tresdb.ui.show($typeError);
          } else if (err.name === 'no file given') {
            tresdb.ui.show($missingError);
          } else {
            tresdb.ui.show($otherError);
          }
          return;
        }

        // Import successful. Switch to batch page.
        tresdb.go('/import/' + batchId);
      });
    });

  };

  this.unbind = function () {
    $('#tresdb-import-upload-form').off();
  };

};
