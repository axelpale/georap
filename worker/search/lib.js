
// eslint-disable-next-line no-useless-escape
const specials = /[,\.:;_\-\/\\|\?!\*\+=\(\){}\[\]&%#"'<>~]/g;

exports.heads = (str) => {
  // Return array of strings with many versions of the given string.
  //
  // Example:
  //   heads('hello') => ['h', 'he', 'hel', 'hell', 'hello']
  //
  const arr = [];

  for (let i = 0; i < str.length; i += 1) {
    arr.push(str.substr(0, i + 1));
  }

  return arr;
};

exports.words = (str) => {
  // Return array of strings, the space-separated parts of the original.
  return str.split(' ');
};

exports.wordheads = (str) => {
  // wordheads('hello world')
  // => ['h', 'he', 'hel', 'hell', 'hello', 'w', 'wo', 'wor', 'worl', 'world']
  const words = exports.words(str);
  const heads = words.map((w) => {
    return exports.heads(w);
  });
  return Array.prototype.concat.apply([], heads);
};

exports.normalize = (str) => {
  // Replace punctuation and other special characters with spaces.
  const spaces = str.replace(specials, ' ');
  const trimmed = spaces.replace(/\s\s+/g, ' ').trim();
  return trimmed.toLowerCase();
};
