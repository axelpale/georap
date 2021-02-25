var template = require('./template.ejs');
var ui = require('tresdb-ui');
var uploadSizeLimit = tresdb.config.uploadSizeLimit;

module.exports = function (onAttachments) {

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
          $form.removeClass('is-uploading').addClass('is-filesize-error');
          console.error('max upload size');
        }
      })

      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: ajaxData,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        complete: function () {
          $form.removeClass('is-uploading');
        },
        success: function (data, textStatus, xhr) {
          var SUCCESS = 200;
          if (xhr.status === SUCCESS) {
            $form.addClass('is-success');
            onAttachments(null, data.attachments);
          } else {
            $form.addClass('is-error');
            $errorMsg.text(textStatus);
          }
        },
        error: function (err) {
          $form.addClass('is-error');
          console.error(err);
          $errorMsg.text(err.message);
        },
      });
    });

    bound.form = $form;
  };

  this.unbind = function () {
    ui.offAll(bound);
  };
};
