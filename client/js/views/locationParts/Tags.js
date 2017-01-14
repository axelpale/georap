var template = require('./tags.ejs');
var tagsListTemplate = require('./tagsList.ejs');
var tagsFormListTemplate = require('./tagsFormList.ejs');

module.exports = function (location, tags) {


  var bindFormList = function () {
    // For each form tag, bind a handler
    var allTags = tags.getAllTags();
    allTags.forEach(function (tag) {
      var button = $('#tresdb-location-edit-tags-' + tag + '-button');

      button.click(function (ev) {
        ev.preventDefault();

        if (location.hasTag(tag)) {
          location.removeTag(tag, function (err) {
            if (err) {
              console.error(err);
              return;
            }
          });
        } else {
          location.addTag(tag, function (err) {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    });
  };


  this.render = function () {
    return template({
      tagsListHtml: tagsListTemplate({ tags: location.getTags() }),
      tagsFormListHtml: tagsFormListTemplate({
        allTags: tags.getAllTags(),
        locationTags: location.getTags(),
      }),
    });
  };

  this.bind = function () {

    location.on('tags_changed', function () {
      // Update tags list
      var tagsListHtml = tagsListTemplate({ tags: location.getTags() });
      $('#tresdb-location-tags').html(tagsListHtml);

      // Update form
      var tagsFormListHtml = tagsFormListTemplate({
        allTags: tags.getAllTags(),
        locationTags: location.getTags(),
      });
      $('#tresdb-location-edit-tags-list').html(tagsFormListHtml);
      // Rebind
      bindFormList();
    });

    // Form
    bindFormList();

    $('#tresdb-location-edit-tags-show').click(function (ev) {
      ev.preventDefault();

      if ($('#tresdb-location-edit-tags-form').hasClass('hidden')) {
        // Show
        $('#tresdb-location-edit-tags-form').removeClass('hidden');
        // Remove possible error messages
      } else {
        // Hide
        $('#tresdb-location-edit-tags-form').addClass('hidden');
        // Remove possible error messages
      }
    });

    $('#tresdb-location-edit-tags-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-edit-tags-form').addClass('hidden');
    });

  };
};
