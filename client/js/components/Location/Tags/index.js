var tags = require('../../../stores/tags');
var template = require('./template.ejs');
var tagsListTemplate = require('./tagsList.ejs');
var statusFormListTemplate = require('./statusFormList.ejs');
var tagsFormListTemplate = require('./tagsFormList.ejs');

var allStatusTags = [
  'walk-in',
  'active',
  'buried',
  'demolished',
  'guarded',
  'locked',
];
var allTypeTags = tags.getTagsNotIn(allStatusTags);

var isTypeTag = function (t) {
  return allTypeTags.indexOf(t) !== -1;
};
var isStatusTag = function (t) {
  return allStatusTags.indexOf(t) !== -1;
};

module.exports = function (location) {
  var self = this;

  this.bind = function ($mount) {
    var locTags = location.getTags();
    var locTypeTags = locTags.filter(isTypeTag);
    var locStatusTags = locTags.filter(isStatusTag);

    var isDemolished = (locStatusTags.indexOf('demolished') !== -1);

    $mount.html(template({
      isDemolished: isDemolished,
      tagsListHtml: tagsListTemplate({
        isDemolished: isDemolished,
        typeTags: locTypeTags,
        statusTags: locStatusTags,
        tagToSymbolUrl: tags.tagToSymbolUrl,
      }),
      statusFormListHtml: statusFormListTemplate({
        allStatusTags: allStatusTags,
        statusTags: locStatusTags,
        tagToSymbolUrl: tags.tagToSymbolUrl,
      }),
      tagsFormListHtml: tagsFormListTemplate({
        allTags: allTypeTags,
        typeTags: locTypeTags,
        tagToSymbolUrl: tags.tagToSymbolUrl,
      }),
    }));

    var $show = $('#tresdb-location-edit-tags-show');
    var $form = $('#tresdb-location-edit-tags-form');
    var $cancel = $('#tresdb-location-edit-tags-cancel');
    var $progress = $('#tresdb-location-edit-tags-progress');
    var $error = $('#tresdb-location-edit-tags-error');

    location.on('location_tags_changed', function () {
      $mount.empty();
      self.bind($mount);
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

    var formSubmit = function (newTags) {
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
    };

    $('#tresdb-tag-default').click(function (ev) {
      ev.preventDefault();
      var newTags = locStatusTags.slice();
      formSubmit(newTags);
    });

    allTypeTags.forEach(function (tag) {
      $('#tresdb-tag-' + tag).click(function (ev) {
        ev.preventDefault();
        var newTags = locStatusTags.slice();
        newTags.push(tag);
        formSubmit(newTags);
      });
    });

    $('#tresdb-tag-unknown').click(function (ev) {
      ev.preventDefault();
      var newTags = locTypeTags.slice();
      formSubmit(newTags);
    });

    allStatusTags.forEach(function (tag) {
      $('#tresdb-tag-' + tag).click(function (ev) {
        ev.preventDefault();
        var newTags = locTypeTags.slice();
        newTags.push(tag);
        formSubmit(newTags);
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
