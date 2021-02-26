/* eslint-disable no-magic-numbers */
var template = require('./template.ejs');
var FileUpload = require('./FileUpload');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');
var uploadSizeLimit = tresdb.config.uploadSizeLimit;

module.exports = function () {

  var self = this;
  emitter(self);

  var bound = {};

  this.bind = function ($mount) {
    $mount.html(template({}));

    var $form = $mount.find('form.uploader-box');
    var $errorMsg = $('.uploader-box-error');
    var droppedFiles = false;

    // Display selected files
    var inputEl = document.getElementById('uploader-file-input');
    // var labelEl	 = inputEl.nextElementSibling;
    // var labelVal = labelEl.innerHTML;
    // var nameTemplate = (inputEl.getAttribute('data-multiple-caption') || '');

    // inputEl.addEventListener('change', function (ev) {
    //   var fileName = '';
    //   if (inputEl.files && inputEl.files.length > 1) {
    //     fileName = nameTemplate.replace('{count}', inputEl.files.length);
    //   } else {
    //     fileName = ev.target.value.split('\\').pop();
    //   }
    //
    //   if (fileName) {
    //     labelEl.querySelector('span').innerHTML = fileName;
    //   } else {
    //     labelEl.innerHTML = labelVal;
    //   }
    // });

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

    $form.on('submit', function (e) {
      if ($form.hasClass('is-uploading')) {
        return false;
      }

      $form.addClass('is-uploading').removeClass('is-error');

      // Prevent default form submit
      e.preventDefault();

      // Mix selected files and dropped files.
      var ajaxData = new FormData($form.get(0));
      if (droppedFiles) {
        $.each(droppedFiles, function (i, file) {
          ajaxData.append(inputEl.name, file);
        });
      }

      // Test file sizes
      ajaxData.getAll(inputEl.name).forEach(function (file) {
        if (file.size > uploadSizeLimit) {
          // $form.removeClass('is-uploading').addClass('is-filesize-error');
          console.error('too large upload size');
        }
      });

      // Emit each new file to upload
      var fileuploads = ajaxData.getAll(inputEl.name).map(function (file) {
        var fileupload = new FileUpload(file);
        self.emit('fileupload', fileupload);
        return fileupload;
      });

      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: ajaxData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        xhr: function () {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function (evt) {
            if (evt.lengthComputable) {
              var percentComplete = (evt.loaded / evt.total) * 100;
              // Place upload progress bar visibility code here
              console.log(evt);
              console.log(percentComplete);

              fileuploads.forEach(function (fileupload) {
                fileupload.emit('progress', percentComplete);
              });
            }
          }, false);
          return xhr;
        },
      })
        .done(function (data, textStatus, xhr) {
          console.log('success');
          var SUCCESS = 200;
          if (xhr.status === SUCCESS) {
            $form.addClass('is-success');
            fileuploads.forEach(function (fileupload, i) {
              fileupload.emit('success', data.attachments[i]);
            });
          } else {
            $form.addClass('is-error');
            $errorMsg.text(textStatus);
            fileuploads.forEach(function (fileupload) {
              fileupload.emit('error', data);
            });
          }
        })
        .fail(function (jqxhr, textStatus, err) {
          $form.addClass('is-error');
          console.error(err);
          $errorMsg.text(err.message);
        })
        .always(function () {
          console.log('deferred always');
          $form.removeClass('is-uploading');
        });
    });

    bound.form = $form;
  };

  this.unbind = function () {
    ui.offAll(bound);
  };
};
