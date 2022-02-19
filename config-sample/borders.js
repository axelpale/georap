// Geographical border boxes for area-sensitive features like export services.
//
// Each border is an array of { east, north, south, west } rectangles, boxes,
// where east and west are longitudes and north and south are latitudes.
//
// The set of boxes resemble a country, a city or any rough area that
// can be modeled reasonably well with a couple of boxes.
//

module.exports = {
  globe: [{ // Global
    east: 180,
    north: 90,
    south: -90,
    west: -180,
  }],

  finland: [{ // Finland
    east: 32.14,
    north: 70.166,
    south: 59.56,
    west: 18.86,
  }],

  finlandPirkanmaa: [ // Pirkanmaa, Finland
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

  norway: [ // Norway
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

  sweden: [ // Sweden
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
};
