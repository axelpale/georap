// Component for search form and results.

//var locations = require('../../stores/locations');
var FormView = require('./Form');
var ResultsView = require('./Results');
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self);

  // State
  var _formView, _resultsView;


  // Public methods

  this.bind = function ($mount) {

    $mount.html(template());

    _formView = new FormView();
    _resultsView = new ResultsView();

    _formView.bind($('#tresdb-search-form'));
    _resultsView.bind($('#tresdb-search-results'));

  };  // end bind

  this.unbind = function () {

    if (_formView) {
      _formView.unbind();
      _resultsView.unbind();
      _formView = null;
      _resultsView = null;
    }
  };

};
