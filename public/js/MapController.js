
var MapModel = require('./MapModel');
var MapView = require('./MapView');

module.exports = function () {
  var model = new MapModel(null);
  var view = new MapView(model);

  this.addControl = function (htmlElement) {
    view.addControl(htmlElement);
  };
};
