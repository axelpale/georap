
var comp = function (a, b) {
  if (a.time < b.time) {
    return 1;
  }
  if (a.time > b.time) {
    return -1;
  }
  if (a.type === 'created') {
    return 1;
  }
  return 0;
};

module.exports = function (entries) {
  // Sorts entries array in place.
  entries.sort(comp);
};
