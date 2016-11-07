
var TYPE_TO_COLOR = {
  'terrain': 'black',
  'roadmap': 'black',
  'hybrid': 'white',
  'satellite': 'white',
};

exports.mapTypeIdToLabelColor = function (typeid) {
  return TYPE_TO_COLOR[typeid];
};
