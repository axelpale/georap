// Enable user to write coordinates to navigate on the map.
//
var template = require('./template.ejs');
var geostamp = require('geostamp');
var ui = require('georap-ui');
var bus = require('georap-bus');
var geometryStore = georap.stores.geometry;
var coordinateSystems = georap.config.coordinateSystems;
var coordinateTemplates = georap.templates;
var defaultSystemName = coordinateSystems[0][0];

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var self = this;
  var $elems = {};
  var $mount = null;

  // Keep track of crosshair position
  var geoms = null;

  // Public methods

  this.bind = function ($mountArg) {
    $mount = $mountArg;
    $mount.html(template({
      systems: coordinateSystems,
      defaultSystemName: defaultSystemName,
    }));

    $elems.form = $mount.find('.coordsform');
    $elems.systemSelector = $mount.find('select.form-control');
    $elems.coordInput = $mount.find('input.coordsform-input');
    $elems.resetBtn = $mount.find('button.coordsform-reset');
    $elems.goBtn = $mount.find('button.coordsform-go');
    $elems.example = $mount.find('.coordsform-example');
    $elems.error = $mount.find('.coordsform-error');

    // Render system specific example when system selection changes.
    var handleSystemChange = function () {
      // DEBUG var selectedSystem = $elems.systemSelector.val();
      // console.log('selectedSystem', selectedSystem);
      self.updateExample();
    };
    $elems.systemSelector.on('change', handleSystemChange);

    $elems.resetBtn.on('click', function (ev) {
      console.log('reset');
      ev.preventDefault();
      // Fill input with the render of current coordinate.
      var systemName = $elems.systemSelector.val();
      var coordsHtml = self.geomsToHtml(systemName);
      // Convert html entities to text
      var span = document.createElement('span');
      span.innerHTML = coordsHtml;
      var coordsText = span.innerText;
      // Reset the input field value
      $elems.coordInput.val(coordsText);
    });

    // Make go button stand out during custom coordinates.
    // Return it default during geometry update.
    var handleChange = function () {
      if ($elems.goBtn.hasClass('btn-default')) {
        $elems.goBtn.addClass('btn-primary').removeClass('btn-default');
      }
    };
    $elems.coordInput.on('input', handleChange);

    // Form submit
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var selectedSystem = $elems.systemSelector.val();
      var coordRaw = $elems.coordInput.val().trim();

      // Call backend
      geometryStore.parseCoordinates({
        system: selectedSystem,
        text: coordRaw,
      }, function (err, coords) {
        if (err) {
          var msg = 'No coordinates could be found from the given text. ' +
            'Ensure the text makes sense and see the example above.';
          $elems.error.find('.alert').html(msg);
          ui.show($elems.error);
          return;
        }

        // Pick WGS84
        const coordsInWgs84 = coords.find(function (c) {
          return c.system === 'WGS84';
        });
        if (!coordsInWgs84) {
          throw new Error('No WGS84 coordinate system found.');
        }

        bus.emit('crosshair_form_submit', {
          latLng: {
            lat: coordsInWgs84.xy.y,
            lng: coordsInWgs84.xy.x,
          },
        });
      });
    });
  }; // /bind

  this.geomsToHtml = function (systemName) {
    // Parameters
    //   systemName
    //     string, the selected system to output current geom
    //
    // Return
    //   string, formatted coordinate
    //
    if (geoms && geoms[systemName]) {
      var systemCoords = geoms[systemName];
      var x = systemCoords[0];
      var y = systemCoords[1];
      // Pick template
      var systemTemplate = coordinateTemplates[systemName];
      var coordsHtml = geostamp.html(systemTemplate, y, x);
      return coordsHtml;
    }
    return '-';
  };

  this.updateExample = function () {
    if ($mount && $elems.example) {
      var systemName = $elems.systemSelector.val();
      var coordsHtml = self.geomsToHtml(systemName);
      $elems.example.html('Example: ' + coordsHtml);
    }
  };

  this.updateGeometry = function (newGeoms) {
    // Update form-specific location.
    //
    // Parameters:
    //   geoms
    //     a map { <systemName>: [x, y], ... }
    //
    geoms = newGeoms;
    // Update example coordinates. Do not update input form because
    // the coordinate input process can be slow and difficult and thus
    // a reset would wipe that hard work away. This is emphasized in
    // mobile context where even a screen rotation can update geometry.
    this.updateExample();
  };

  this.unbind = function () {
    ui.offAll($elems);
    $mount = null;
  };
};
