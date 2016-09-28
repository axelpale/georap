
var Emitter = require('component-emitter');
var MapModel = require('./MapModel');
var MapView = require('./MapView');

module.exports = function (socket, auth) {
  Emitter(this);
  var self = this;

  var model = new MapModel(socket, auth);
  var view = new MapView(model);

  // Initialization

  auth.on('login', function () {
    model.fetchAll();
    // View reacts to a successful fetch.
  });

  auth.on('logout', function () {
    model.removeAll();
  });

  // If logged in already
  if (auth.hasToken()) {
    model.fetchAll();
  }

  // To be changed on refactor
  view.on('state_changed', function (b) {
    self.emit('state_changed', b);
  });

  // Public methods

  this.addControl = function (htmlElement) {
    // Add custom elements e.g. a menu on the map.
    view.addControl(htmlElement);
  };

  this.setState = function (state) {
    // Change viewport state
    view.setState(state);
  };
};
