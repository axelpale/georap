var Emitter = require('component-emitter');
var _ = require('lodash');

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
  menuDiv.className = 'tresdb-map-menu';
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(menuDiv);

  model.on('update', function (menuitems) {

    // Clear menu
    $(menuDiv).empty();

    _.each(menuitems, function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-primary';
      b.innerHTML = item.label;
      menuDiv.appendChild(b);

      b.addEventListener('click', item.action);
    });
  });
};
