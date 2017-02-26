// Component for search form and results.

var markers = require('../../stores/markers');
var tagsTemplate = require('../Location/Tags/tagsList.ejs');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');

var FOCUS_DELAY = 200;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring

  // Init
  var self = this;
  emitter(self);

  var _submitHandler;
  var _responseHandler;

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template());

    var $form = $('#tresdb-search-form');
    var $text = $('#tresdb-search-text');
    var $results = $('#tresdb-search-results');

    // After page has loaded, focus to text input field
    setTimeout(function () {
      $text.focus();
    }, FOCUS_DELAY);

    _submitHandler = function () {
      var text = $text.val().trim();

      return markers.getFiltered({
        text: text,
      }, _responseHandler);
    };

    _responseHandler = function (err, results) {
      // Hide progress
      if (err) {
        // Display error
        console.error(err);
        return;
      }

      $results.html(listTemplate({
        tagsTemplate: tagsTemplate,
        markers: results,
      }));
    };

    $form.submit(function (ev) {
      ev.preventDefault();
      return _submitHandler();
    });

    // Do instant query if querystring has something useful.
    if (query.hasOwnProperty('text')) {
      $text.val(query.text.trim());
      _submitHandler();
    }

  };  // end bind

  this.unbind = function () {
    var $form = $('#tresdb-search-form');

    $form.off();
  };

};
