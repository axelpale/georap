// Register coordinate systems to be used.
// These coordinate systems will be displayed on the location page.
// These systems are also available for exportServices.
//
// Each post has the form:
//   [<cordinate system name>,
//    <proj4 projection definition>,
//    <output template>]
// Where:
//   coordinate system name
//     String. Visible to user.
//   proj4 projection definition
//     See https://epsg.io/ and for proj4js projection definitions
//     and http://proj4js.org/ for syntax details.
//   output template
//     String. The pretty print of coodinates in EJS templating language.
//     See available template variables and functions below.
//
// Template variables:
//   lat
//     Latitude
//   lng
//     Longitude
//   absLat
//     Math.abs(lat)
//   absLng
//     Math.abs(lng)
//
// Template functions:
//   getLatDir(degrees)
//     Cardinal direction for latitude.
//     Returns 'N' or 'S'
//   getLngDir(degrees)
//     Cardinal direction for longitude.
//     Returns 'W' or 'E'
//   getD(degrees)
//     Decimal degrees
//     For example: 12.345678°
//   getDM(degrees)
//     Degrees minutes.
//     For example: 12° 34.5678"
//   getDMS(degrees)
//     Degrees minutes seconds format.
//     For example: 12° 34" 56.78'
//
module.exports = [
  [
    'WGS84',
    '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
    '<%= getD(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
    '<%= getD(absLng) %>&nbsp;<%= getLngDir(lng) %>',
  ],
  [
    'WGS84-DM',
    '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
    '<%= getDM(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
    '<%= getDM(absLng) %>&nbsp;<%= getLngDir(lng) %>',
  ],
  [
    'WGS84-DMS',
    '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
    '<%= getDMS(absLat) %>&nbsp;<%= getLatDir(lat) %>, ' +
    '<%= getDMS(absLng) %>&nbsp;<%= getLngDir(lng) %>',
  ],
  // For example, the official coordinate system in Finland:
  [
    'ETRS-TM35FIN',
    '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs',
    'N&nbsp;<%= Math.round(lat) %>, E&nbsp;<%= Math.round(lng) %>',
  ],
  [
    'SWEREF99-TM',
    '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs',
    'N&nbsp;<%= Math.round(lat) %>, E&nbsp;<%= Math.round(lng) %>',
  ],
];
