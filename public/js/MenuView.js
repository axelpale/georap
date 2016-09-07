var Emitter = require('component-emitter');
var _ = require('lodash');

var glyphiconTemplate = require('../templates/glyphicon.ejs');

module.exports = function (map, model) {
  // Parameters:
  //   map
  //     instance of google.maps.Map
  //   model
  //     Instance of MenuModel. Is listened for update events.
  //

  Emitter(this);
  var self = this;

  // Initialization
  var menuDiv = document.createElement('div');
  menuDiv.className = 'tresdb-map-menu btn-group';
  menuDiv.role = 'group';
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(menuDiv);

  model.on('update', function (menuitems) {

    // Clear menu
    $(menuDiv).empty();

    _.each(menuitems, function (item) {
      var b, g;
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-primary';
      b.innerHTML = item.label;

      // Bootstrap Glyphicon if specified.
      if (item.hasOwnProperty('glyphicon')) {
        g = glyphiconTemplate({name: item.glyphicon});
        b.innerHTML = g + ' ' + b.innerHTML;
      }

      menuDiv.appendChild(b);

      b.addEventListener('click', item.action);
    });
  });
};
