
var ExportComponent = require('./Export');
var ViewOnComponent = require('./ViewOn');
var EntryCreationComponent = require('../Entriex/Creation');
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');

module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

  var listeners = {};
  var children = {};

  var makeOpenable = function (viewName, View) {
    var $openBtn = $('#' + viewName + '-open');
    var $container = $('#' + viewName + '-container');

    // Define view close
    var exitView = function () {
      if (children[viewName]) {
        children[viewName].unbind();
        children[viewName].off();
        $container.empty();
        delete children[viewName];
      }
    };

    // Handle button
    $openBtn.click(function () {
      if (children[viewName]) {
        exitView();
      } else {
        children[viewName] = new View(location);
        children[viewName].bind($container);
        children[viewName].once('exit', exitView);
      }
    });

    // Set way to off()
    listeners[viewName] = $openBtn;
  };

  self.bind = function ($mount) {
    $mount.html(template({}));

    makeOpenable('entry-creation', EntryCreationComponent);
    makeOpenable('location-export', ExportComponent);
    makeOpenable('location-viewon', ViewOnComponent);
  };

  self.unbind = function () {
    ui.offAll(listeners);
    ui.unbindAll(children);
  };
};
