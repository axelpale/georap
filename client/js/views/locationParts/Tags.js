var tags = require('../../stores/tags');
var template = require('./Tags.ejs');
var tagsListTemplate = require('./tagsList.ejs');
var tagsFormListTemplate = require('./tagsFormList.ejs');

module.exports = function (location) {

  this.bind = function ($mount) {

    $mount.html(template({
      tagsListHtml: tagsListTemplate({ tags: location.getTags() }),
      tagsFormListHtml: tagsFormListTemplate({
        allTags: tags.getAllTags(),
        locationTags: location.getTags(),
      }),
    }));

    var $list = $('#tresdb-location-edit-tags-list');
    var $show = $('#tresdb-location-edit-tags-show');
    var $form = $('#tresdb-location-edit-tags-form');
    var $cancel = $('#tresdb-location-edit-tags-cancel');
    var $progress = $('#tresdb-location-edit-tags-progress');
    var $error = $('#tresdb-location-edit-tags-error');

    location.on('tags_changed', function () {
      // Update tags list
      var tagsListHtml = tagsListTemplate({ tags: location.getTags() });
      $('#tresdb-location-tags').html(tagsListHtml);

      // Update form
      var tagsFormListHtml = tagsFormListTemplate({
        allTags: tags.getAllTags(),
        locationTags: location.getTags(),
      });
      $list.html(tagsFormListHtml);
    });

    $show.click(function (ev) {
      ev.preventDefault();

      // Remove possible error messages
      $error.addClass('hidden');

      if ($form.hasClass('hidden')) {
        // Show
        $form.removeClass('hidden');
      } else {
        // Hide
        $form.addClass('hidden');
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      $form.addClass('hidden');
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var newTags = [];

      // See http://stackoverflow.com/a/590040/638546
      var q = '#tresdb-location-edit-tags-form ' +
              'input:checkbox[name=tags]:checked';
      $(q).each(function () {
        newTags.push($(this).val());
      });

      $progress.removeClass('hidden');
      $form.addClass('hidden');

      location.setTags(newTags, function (err) {

        $progress.addClass('hidden');

        if (err) {
          console.error(err);
          // Show error message
          $error.removeClass('hidden');
          return;
        }
        // Everything ok
      });
    });

  };

  this.unbind = function () {
    location.off('tags_changed');
    $('#tresdb-location-edit-tags-show').off();
    $('#tresdb-location-edit-tags-cancel').off();
    $('#tresdb-location-edit-tags-form').off();
  };
};
