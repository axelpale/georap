var getPoints = require('tresdb-points');

module.exports = function (ev) {
  var p, h;

  p = getPoints(ev);

  h = '<span class="glyphicon glyphicon-star" aria-hidden="true"></span>';

  if (p > 0) {
    // Plus sign
    h += ' <span>+' + p + '</span>';
  } else if (p < 0) {
    // Special, wide minus sign
    h += ' <span>–' + Math.abs(p) + '</span>';
  } else {
    return ''; // No points
  }

  return h;
};
