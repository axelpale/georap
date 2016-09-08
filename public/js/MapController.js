
var MapModel = require('./MapModel');
var MapView = require('./MapView');

module.exports = function (socket, auth) {
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

  // Public methods

  this.addControl = function (htmlElement) {
    // Add custom elements e.g. a menu on the map.
    view.addControl(htmlElement);
  };
};
