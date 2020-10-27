module.exports = function (bounds) {
  // Convert bounds to a rectagle Polygon.
  //
  // Parameters:
  //   bounds: object with props
  //     east
  //       longitude
  //     north
  //       latitude
  //     south
  //       latitude
  //     west
  //       longitude
  //
  // Return:
  //   GeoJSON Polygon object
  //
  return {
    type: 'Polygon',
    coordinates: [
      [
        [bounds.west, bounds.north], // lng, lat
        [bounds.east, bounds.north],
        [bounds.east, bounds.south],
        [bounds.west, bounds.south],
        [bounds.west, bounds.north], // must close with same point
      ],
    ],
  };
};
