// Camaro XML template

const extendedDataTemplate = ['ExtendedData//SimpleData', {
  name: '@name',
  value: '.',
}];

const placemarkTemplate = {
  name: 'name',
  extendedData: extendedDataTemplate,
  description: 'description',
  coordinates: 'Point/coordinates',
  line: 'LineString/coordinates',
  polygon: 'Polygon//coordinates',
};

const overlayTemplate = {
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
