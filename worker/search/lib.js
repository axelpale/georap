
// eslint-disable-next-line no-useless-escape
var specials = /[,\.:;_\-\/\\|\?!\*\+=\(\){}\[\]&%#"'<>~]/g;

exports.heads = function (str) {
  // Return array of strings with many versions of the given string.
  //
  // Example:
  //   heads('hello') => ['h', 'he', 'hel', 'hell', 'hello']

  var i, arr;
  arr = [];

  for (i = 0; i < str.length; i += 1) {
    arr.push(str.substr(0, i + 1));
  }

  return arr;
};

exports.words = function (str) {
  // Return array of strings, the space-separated parts of the original.
  return str.split(' ');
};

exports.wordheads = function (str) {
  // wordheads('hello world')
  // => ['h', 'he', 'hel', 'hell', 'hello', 'w', 'wo', 'wor', 'worl', 'world']
  var words = exports.words(str);
  var heads = words.map(function (w) {
    return exports.heads(w);
  });
  return Array.prototype.concat.apply([], heads);
};

exports.normalize = function (str) {
  // Replace punctuation and other special characters with spaces.
  var spaces = str.replace(specials, ' ');
  var trimmed = spaces.replace(/\s\s+/g, ' ').trim();
  return trimmed.toLowerCase();
};
