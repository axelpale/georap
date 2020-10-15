// Camaro XML template

var extendedDataTemplate = ['ExtendedData//SimpleData', {
  name: '@name',
  value: '.',
}];

var placemarkTemplate = {
  name: 'name',
  extendedData: extendedDataTemplate,
  description: 'description',
  coordinates: 'Point/coordinates',
  line: 'LineString/coordinates',
  polygon: 'Polygon//coordinates',
};

var overlayTemplate = {
  name: 'name',
  description: 'description',
  href: './Icon/href',
  viewBoundScale: 'number(./Icon/viewBoundScale)',
  latLonBox: {
    north: 'number(./LatLonBox/north)',
    south: 'number(./LatLonBox/south)',
    east: 'number(./LatLonBox/east)',
    west: 'number(./LatLonBox/west)',
    rotation: 'number(./LatLonBox/rotation)',
  },
};

module.exports = {
  rootLocations: ['//Document/Placemark', placemarkTemplate],
  folders: ['//Folder', {
    description: 'description',
    locations: ['./Placemark', placemarkTemplate],
    overlays: ['./GroundOverlay', overlayTemplate],
  }],
};
