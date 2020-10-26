module.exports = function () {
  // Return a favorable grid dimensions for current viewport.

  // Viewport size
  var viewportWidth = $(window).width();
  var viewportHeight = $(window).height();

  // Eye size in pixels
  var pixPerEye = 50;

  return {
    width: Math.round(viewportWidth / pixPerEye),
    height: Math.round(viewportHeight / pixPerEye),
  };
};
