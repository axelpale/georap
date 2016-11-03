
// Earth radius in meters.
var R = 6371000;

// Desired distance between markers in pixels, somewhat.
var D = 200;

// Assumed width of average view of the user in pixels.
var W = 1000;

// Ratio between levels
var r = 0.5;

exports.getFromZoomLevel = function (level) {
  // This function defines the neighborhood size as a function of zoom level.
  //
  // A method to obtain reasonable neighborhood:
  // On level 0, the width of the map is the length of the equator.
  // Thus, upper limit for maxDistance is 2*PI*R / 2, where R is the
  // radius of the earth, 6 371 000 m.
  //     Let's assume user's view is 1000 px wide and a marker is 25 px wide.
  // Also, assume the radius of 50 px to provide loose enough marker
  // arrangement. Now, if 1000 px ~ 2*PI*R, then 50 px ~ 50 * 2*PI*R / 1000.
  // The maxDistance in meters on level 0 is therefore PI * R / 10.
  //     For each lower abstraction level, i.e. higher level number, the
  // width of the view in meters is halved. For level 1, 1000 px ~ PI*R, for
  // level 2, 1000 px ~ PI*R/2, and so on. Thus, for level n, 1000 px ~
  // 2*PI*R * (1/2)^n, and the radius around the marker i.e. maxDistance
  // (50 * 2*PI*R / 1000) * (1/2)^n.
  //     To translate this on JS, let us start with the form:
  // maxDistance = ((D / 2) * 2*PI*R / W) * Math.pow(0.5, level), where D is
  // the desired distance between markers and W is the average width of
  // the view. We simplify the expression:
  return (D * Math.PI * R * Math.pow(r, level)) / W;
};
