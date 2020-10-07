module.exports = function (s) {
  // Capitalize the first letter of string s.
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
