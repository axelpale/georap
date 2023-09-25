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

// Premade bounds
const borders = require('./borders');

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
    borders.globe,
  ],
  [
    'Paikkatietoikkuna',
    'http://www.paikkatietoikkuna.fi/web/fi/kartta' +
    '?ver=1.17&' +
    'zoomLevel=<%= Math.max(Math.min(zoom - 6, 13), 0) %>&' +
    'coord=<%= longitude %>_<%= latitude %>&' +
    'mapLayers=base_35+100+default&showMarker=true&showIntro=false',
    'ETRS-TM35FIN',
    borders.finland,
  ],
  [
    'Karttapaikka',
    'https://asiointi.maanmittauslaitos.fi/karttapaikka/' +
    '?lang=fi&share=customMarker&' +
    'n=<%= latitude %>&e=<%= longitude %>&' +
    'zoom=<%= Math.max(Math.min(zoom - 6, 13), 0) %>',
    'ETRS-TM35FIN',
    borders.finland,
  ],
  [
    'Tampereen karttapalvelu',
    'https://kartat.tampere.fi/oskari/' +
    '?zoomLevel=<%= Math.max(Math.min(zoom - 6, 15), 5) %>&' +
    'coord=<%= longitude %>_<%= latitude %>&' +
    'showMarker=true&showIntro=false',
    'ETRS-TM35FIN',
    borders.finlandPirkanmaa,
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
    borders.finland,
  ],
  [
    'Vanhat kartat',
    'https://vanhatkartat.fi/' +
    '#<%= Math.max(Math.min(zoom - 1, 15), 3) %>' +
    '/<%= latitude %>/<%= longitude %>',
    'WGS84',
    borders.finland,
  ],
  [
    'Lantmäteriet',
    'https://minkarta.lantmateriet.se/' +
    '?e=<%= longitude %>&n=<%= latitude %>&' +
    'z=<%= Math.max(Math.min(zoom - 4, 15), 0) %>&' +
    'background=1&boundaries=true',
    'SWEREF99-TM',
    borders.sweden,
  ],
  [
    'Finn.no',
    'https://kart.finn.no/' +
    '?lng=<%= longitude %>&lat=<%= latitude %>&' +
    'zoom=<%= Math.max(Math.min(zoom, 21), 4) %>&' +
    'mapType=normaphd',
    'WGS84',
    borders.norway,
  ],
  [
    'Gule Sider',
    'https://kart.gulesider.no/' +
    '?c=<%= latitude %>,<%= longitude %>&' +
    'z=<%= Math.max(Math.min(zoom, 20), 3) %>&' +
    'l=aerial',
    'WGS84',
    borders.norway,
  ],
  [
    'Norgeskart',
    'https://norgeskart.no/#!' +
    '?project=norgeskart' +
    '&layers=1002' +
    '&zoom=<%= Math.max(Math.min(zoom - 2, 18), 1) %>' +
    '&lat=<%= latitude %>' +
    '&lon=<%= longitude %>' +
    '&markerLat=<%= latitude %>' +
    '&markerLon=<%= longitude %>',
    'SWEREF99-TM',
    borders.norway,
  ],
  [
    'Austrian BEV Topo',
    'https://maps.bev.gv.at/#/center/' +
    '<%= longitude %>,<%= latitude %>/' +
    'zoom/<%= Math.max(Math.min(zoom, 16), 7) %>',
    'WGS84',
    borders.austria,
  ],
];
