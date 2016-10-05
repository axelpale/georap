var Emitter = require('component-emitter');

module.exports = function () {

  var hub = new Emitter();

  this.route = function (routeName, routeHandler) {
    // Return nothing
    hub.on(routeName, routeHandler);
  };

  this.go = function (routeName) {
    hub.emit(routeName);
  };
};
