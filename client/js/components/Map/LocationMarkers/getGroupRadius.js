module.exports = function (bounds) {
  // Return a favorable distfilter group radius for current viewport.

  // Viewport size in px
  var viewportWidth = $(window).width();
  // Viewport width in degrees
  var boundsWidth = bounds.east - bounds.west;
  // Eye size in pixels
  var radiusPx = 50;
  // Convert px to degrees.
  // Math: rpx / wpx = rdeg / wdeg
  // <=> rdeg = wdeg * rpx / wpx
  return boundsWidth * radiusPx / viewportWidth;
};
