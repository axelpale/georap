// A tool to convert a free-text coordinate to a number.
//

// Coordinate detection patterns.
// A mapping from system name to an array of RegExp.
// The first matching RegExp is used to capture numeric values.
var systems = {
  'WGS84': {
    captureGroupWeights: [1],
    directionPattern: /\s*[NEWS]\s*/i,
    digitPatterns: [
      /^\s*[NEWS]?\s*([-+]?\d+[,.]?\d*)\s*°?\s*[NEWS]?\s*$/i,
    ],
  },
  'WGS84-DMS': {
    captureGroupWeights: [1, 1 / 60, 1 / 3600],
    patterns: [
      /^\s*[NEWS]?\s*([-+]?\d+[,.]?\d*)\s*°?\s*[NEWS]?\s*$/i,
    ],
  },
};

module.exports = function (text, systemName) {
  if (!systems[systemName]) {
    throw new Error('Unsupported coordinate system: ' + systemName);
  }

  var system = systems[systemName];
  var i, matches;
  for (i = 0; i < system.patterns.length; i += 1) {
    matches = text.match(system.patterns[i]);
    if (matches) {
      system.numCaptureGroups
    }
  }
};
