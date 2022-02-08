// Register location export services here.
// With these, user can inspect the location on other online maps.
//
// Each post has the form:
//   [<service name>, <url pattern>, <coordinate system name>, <bounds>]
// Where:
//   service name
//     String.
//   url pattern
//     String. URL to the service in EJS templating language.
//     See available template variables below.
//   coord system
//     String. Name of the coordinate system to use for variables.
//   bounds
//     Array of LatLngBoundsLiteral, areas where the service is available.
//     Is an array of objects with properties east, north, south, west.
//     Elements are equivalent to LatLngBoundsLiteral of Google Maps JS API.
//
// Variables available in URL pattern:
//   latitude
//   longitude
//
module.exports = [
  [
    'GeoHack',
    'https://tools.wmflabs.org/geohack/geohack.php' +
    '?language=en&params=<%= latitude %>;<%= longitude %>_type:' +
    '<%= (zoom <= 5) ? "country" : ' +
    '    (zoom <= 8) ? "state" : ' +
    '    (zoom <= 10) ? "adm1st" : ' +
    '    (zoom <= 11) ? "adm2nd" : ' +
    '    (zoom <= 12) ? "adm3rd" : ' +
    '    (zoom <= 13) ? "event" : ' +
    '    (zoom <= 14) ? "airport" : "landmark" %>',
    'WGS84',
    [{ // Global
      east: 180,
      north: 90,
      south: -90,
      west: -180,
    }],
  ],
  [
    'Paikkatietoikkuna',
    'http://www.paikkatietoikkuna.fi/web/fi/kartta' +
    '?ver=1.17&' +
    'zoomLevel=<%= Math.max(Math.min(zoom - 6, 13), 0) %>&' +
    'coord=<%= longitude %>_<%= latitude %>&' +
    'mapLayers=base_35+100+default&showMarker=true&showIntro=false',
    'ETRS-TM35FIN',
    [{ // Finland
      east: 32.14,
      north: 70.166,
      south: 59.56,
      west: 18.86,
    }],
  ],
  [
    'Karttapaikka',
    'https://asiointi.maanmittauslaitos.fi/karttapaikka/' +
    '?lang=fi&share=customMarker&' +
    'n=<%= latitude %>&e=<%= longitude %>&' +
    'zoom=<%= Math.max(Math.min(zoom - 6, 13), 0) %>',
    'ETRS-TM35FIN',
    [{ // Finland
      east: 32.14,
      north: 70.166,
      south: 59.56,
      west: 18.86,
    }],
  ],
  [
    'Tampereen karttapalvelu',
    'https://kartat.tampere.fi/oskari/' +
    '?zoomLevel=<%= Math.max(Math.min(zoom - 6, 15), 5) %>&' +
    'coord=<%= longitude %>_<%= latitude %>&' +
    'showMarker=true&showIntro=false',
    'ETRS-TM35FIN',
    [
      { // Northern Pirkanmaa, Finland
        east: 24.178,
        north: 61.869,
        south: 61.556,
        west: 23.691,
      },
      { // Southern Pirkanmaa, Finland
        east: 24.079,
        north: 61.596,
        south: 61.377,
        west: 23.493,
      },
    ],
  ],
  [
    'Museovirasto',
    'https://kartta.museoverkko.fi/' +
    '?zoomLevel=<%= Math.max(Math.min(zoom - 6, 12), 0) %>&' +
    'coord=<%= longitude %>_<%= latitude %>&' +
    'mapLayers=' +
    '17+100+default,' +
    '133+100+s_1629683825662,' + // Kiinteät muinaisjäännökset, pisteet
    '142+100+s_1625822858668,' + // Mahdolliset muinaisjäännökset, pisteet
    '136+100+s_1629685777366,' + // Luonnonmuodostumat, pisteet
    '145+100+s_1629686990761,' + // Muut kohteet, pisteet
    '139+100+s_1629686211301,' + // Löytöpaikat, pisteet
    '161+100+s_1629689845683&' + // Muut kulttuuriperintökohteet, pisteet
    'showMarker=true&' +
    'showIntro=false',
    'ETRS-TM35FIN',
    [{ // Finland
      east: 32.14,
      north: 70.166,
      south: 59.56,
      west: 18.86,
    }],
  ],
  [
    'Lantmäteriet',
    'https://minkarta.lantmateriet.se/' +
    '?e=<%= longitude %>&n=<%= latitude %>&' +
    'z=<%= Math.max(Math.min(zoom - 4, 15), 0) %>&' +
    'background=1&boundaries=true',
    'SWEREF99-TM',
    [
      { // Northern Sweden
        east: 24.17,
        north: 69.07,
        south: 63.07,
        west: 11.74,
      },
      { // Southern Sweden
        east: 19.89,
        north: 63.07,
        south: 54.96,
        west: 10.03,
      },
    ],
  ],
  [
    'Finn.no',
    'https://kart.finn.no/' +
    '?lng=<%= longitude %>&lat=<%= latitude %>&' +
    'zoom=<%= Math.max(Math.min(zoom, 21), 4) %>&' +
    'mapType=normaphd',
    'WGS84',
    [
      { // Northern Norway
        east: 31.84,
        north: 71.40,
        south: 68.30,
        west: 16.30,
      },
      { // Mid North Norway
        west: 12.08,
        south: 67.31,
        east: 20.92,
        north: 69.70,
      },
      { // Mid South Norway
        west: 10.28,
        south: 63.55,
        east: 16.875,
        north: 67.44,
      },
      { // Southern Norway
        west: 3.03,
        south: 57.63,
        east: 13.45,
        north: 64.26,
      },
    ],
  ],
  [
    'Gule Sider',
    'https://kart.gulesider.no/' +
    '?c=<%= latitude %>,<%= longitude %>&' +
    'z=<%= Math.max(Math.min(zoom, 20), 3) %>&' +
    'l=aerial',
    'WGS84',
    [
      { // Northern Norway
        east: 31.84,
        north: 71.40,
        south: 68.30,
        west: 16.30,
      },
      { // Mid North Norway
        west: 12.08,
        south: 67.31,
        east: 20.92,
        north: 69.70,
      },
      { // Mid South Norway
        west: 10.28,
        south: 63.55,
        east: 16.875,
        north: 67.44,
      },
      { // Southern Norway
        west: 3.03,
        south: 57.63,
        east: 13.45,
        north: 64.26,
      },
    ],
  ],
];
