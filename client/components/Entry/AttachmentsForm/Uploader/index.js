var template = require('./template.ejs');
var FileUpload = require('./FileUpload');
var emitter = require('component-emitter');
var ui = require('georap-ui');

var any = function () {
  return true;
};

module.exports = function (opts) {
  if (!opts) {
    opts = {};
  }
  opts = Object.assign({
    filter: any,
  }, opts);

  var self = this;
  emitter(self);

  var bound = {};

  this.bind = function ($mount) {
    $mount.html(template({}));

    var $form = $mount.find('form.uploader-box');
    var droppedFiles = false;

    // Display selected files
    var inputEl = document.getElementById('uploader-file-input');
    // var labelEl	 = inputEl.nextElementSibling;
    // var labelVal = labelEl.innerHTML;

    inputEl.addEventListener('change', function () {
      if (inputEl.files && inputEl.files.length > 0) {
        $form.trigger('submit');
      }
    });

    // Drag behavior
    $form
      .on(
        'drag dragstart dragend dragover dragenter dragleave drop',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
        }
      )
      .on('dragover dragenter', function () {
        $form.addClass('is-dragover');
      })
      .on('dragleave dragend drop', function () {
        $form.removeClass('is-dragover');
      })
      .on('drop', function (e) {
        droppedFiles = e.originalEvent.dataTransfer.files;
        $form.trigger('submit');
      });

    $form.on('submit', function (ev) {
      // Prevent default form submit
      ev.preventDefault();

      // Mix selected files and dropped files.
      var ajaxData = new window.FormData();
      // NOTE Unexpected additional empty files were detected on Chrome
      // on macOS Mojave if constructed like: new FormData($form.get(0))
      if (inputEl.files && inputEl.files.length > 0) {
        Array.from(inputEl.files).forEach(function (file) {
          ajaxData.append(inputEl.name, file);
        });
      }
      // Once appended, clear
      inputEl.value = '';

      if (droppedFiles) {
        $.each(droppedFiles, function (i, file) {
          ajaxData.append(inputEl.name, file);
        });
      }
      // Once appended, clear.
      droppedFiles = false;

      // Emit each new file to upload so that parent can build views.
      // Filter with opts.filter parameter and validate within FileUpload.
      var fileuploads = [];
      var someInvalid = false;
      ajaxData.getAll(inputEl.name).forEach(function (file) {
        var fileupload = new FileUpload(file);
        if (opts.filter(fileupload)) {
          // Emit so that a view becomes built, error or no.
          self.emit('fileupload', fileupload);
          if (fileupload.valid) {
            fileuploads.push(fileupload);
          } else {
            someInvalid = true;
          }
        } else {
          someInvalid = true;
        }
      });

      // If no valid files left, skip submit
      if (fileuploads.length < 1) {
        return;
      }

      // If needed, rebuild the form data to include only the valid files.
      var validAjaxData;
      if (someInvalid) {
        validAjaxData = new window.FormData();
        fileuploads.forEach(function (fileupload) {
          validAjaxData.append(inputEl.name, fileupload.file);
        });
      } else {
        validAjaxData = ajaxData;
      }

      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: validAjaxData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        xhr: function () {
          // For upload progress bar
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function (evt) {
            if (evt.lengthComputable) {
              var percentComplete = (evt.loaded / evt.total) * 100;
              fileuploads.forEach(function (fileupload) {
                fileupload.emit('progress', percentComplete);
              });
            }
          }, false);
          return xhr;
        },
      })
        .done(function (data, textStatus, xhr) {
          var SUCCESS = 200;
          if (xhr.status === SUCCESS) {
            fileuploads.forEach(function (fileupload, i) {
              fileupload.emit('success', data.attachments[i]);
            });
          } else {
            fileuploads.forEach(function (fileupload) {
              fileupload.emit('error', {
                data: data,
                textStatus: textStatus,
              });
            });
          }
        })
        .fail(function (jqxhr, textStatus, err) {
          console.error(err);
          fileuploads.forEach(function (fileupload) {
            fileupload.emit('error', {
              data: err,
              textStatus: textStatus,
            });
          });
        });
      // .always(function () {
      //   console.log('deferred always');
      // });
    });

    bound.form = $form;
  };

  this.unbind = function () {
    ui.offAll(bound);
  };
};
