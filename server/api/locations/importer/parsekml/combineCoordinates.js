module.exports = function (loc) {
  // Combine coordinates from Point, LineString, and Polygon.
  // Parse and compute naive average.

  let combined = loc.coordinates;  // empty string if do coords
  if (loc.line.length > 0) {
    combined = combined + ' ' + loc.line;
  }
  if (loc.polygon.length > 0) {
    combined = combined + ' ' + loc.polygon;
  }

  const points = combined.trim().split(' ');
  const numPoints = points.length;

  const sum = points.reduce((acc, p) => {
    const lonLat = p.split(',');
    acc[0] += parseFloat(lonLat[0]);
    acc[1] += parseFloat(lonLat[1]);
    return acc;
  }, [0, 0]);

  return [
    sum[0] / numPoints,
    sum[1] / numPoints,
  ];
};
