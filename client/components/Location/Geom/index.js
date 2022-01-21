var Opener = require('georap-components').Opener;
var ui = require('georap-ui');
var GeomForm = require('./Form');
var GeomMore = require('./More');
var template = require('./template.ejs');
var renderGeoms = require('./renderGeoms');
var able = georap.stores.account.able;
var MAP_SYSTEM = 'WGS84';

module.exports = function (location) {
  // Parameters
  //   location
  //     a Location Model
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var handlers = {};
  var self = this;

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    var __ = georap.i18n.__;

    // Geom in every available coordinate system
    var geostamps = renderGeoms(location.getAltGeoms());
    var defaultGeostamp = geostamps[0].html;

    // Render
    $mount.html(template({
      location: location,
      geostamp: defaultGeostamp,
      able: able,
      __: __,
    }));

    $elems.geostamp = $mount.find('#location-geom-geostamp');

    var geomForm = null;
    if (able('locations-update')) {
      geomForm = new GeomForm(location.getId(), location.getGeom());
      children.formOpener = new Opener(geomForm);
      children.formOpener.bind({
        $container: $mount.find('#location-geom-container'),
        $button: $mount.find('#location-geom-edit'),
      });
    }

    var geomMore = new GeomMore(geostamps);
    var iconDown = '<span class="glyphicon glyphicon-chevron-down"></span>';
    var iconUp = '<span class="glyphicon glyphicon-chevron-up"></span>';
    children.moreOpener = new Opener(geomMore, {
      labelClosed: iconDown + ' ' + __('more'),
      labelOpen: iconUp + ' ' + __('less'),
    });
    children.moreOpener.bind({
      $container: $mount.find('#location-geom-more'),
      $button: $mount.find('#location-geom-more-open'),
    });

    // Register handlers
    // eslint-disable-next-line dot-notation
    handlers['location_geom_changed'] = function () {
      // Update coords on geom change.
      // Get coords in each coord system.
      var geoms = location.getAltGeoms();
      var newGeostamps = renderGeoms(geoms);
      var newDefaultGeostamp = newGeostamps[0].html;
      // Default system (e.g. WGS84)
      $elems.geostamp.html(newDefaultGeostamp);
      // Other systems
      geomMore.update(newGeostamps);

      // Update form for next bind. This does not rewrite rendered values.
      // TODO alt geoms should be full GeoJSON objects, not only coords
      if (geomForm) {
        var newCoords = geoms[MAP_SYSTEM];
        geomForm.update({
          type: 'Point',
          coordinates: newCoords,
        });
      }
    };
    ui.onBy(location, handlers);
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      ui.offBy(location, handlers);
      handlers = {};
      $mount = null;
    }
  };
};
