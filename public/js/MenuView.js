var Emitter = require('component-emitter');
var _ = require('lodash');

var glyphiconTemplate = require('../templates/glyphicon.ejs');

module.exports = function (map, model) {
  // Parameters:
  //   map
  //     instance of MapController. To insert menu.
  //   model
  //     Instance of MenuModel. Is listened for update events.
  //

  Emitter(this);
  var self = this;

  // Initialization
  var menuDiv = document.createElement('div');
  menuDiv.className = 'tresdb-map-menu';

  map.addControl(menuDiv);

  model.on('update', function (menu, user) {

    // Programmer error check. Crash immediately.
    if (!user.hasOwnProperty('name') || !user.hasOwnProperty('admin')) {
      throw new Error('Invalid user object');
    }

    // Turn to jQuery for easier handling.
    // Without it, we would need to wait a bit for menu to render before
    // attaching handlers with document.getElementById(...).
    var $menuDiv = $(menuDiv);

    // Clear menu
    $menuDiv.empty();

    // Render menu
    $menuDiv.html(menu.template({
      glyphicon: glyphiconTemplate,
      user: user  // might be undefined
    }));

    // Add onclick handlers.
    _.each(menu.onclicks, function (handler, id) {
      var elid = '#tresdb-menu-' + id;
      var b = $menuDiv.find(elid);
      if (b === null) {
        console.error('No element with id ' + elid);
      } else {
        b.click(handler);
      }
    });
  });
};
