// Collects paths from markdown links [name](path)
var COLLECT_IMAGE_URLS = /(?:!\[)[^\]]*\]\(([^)]+)\)/g;

exports.find = function (markdown) {
  // Find url paths from markdown links
  //
  // Return
  //   list of path strings, relative file paths or absolute urls
  //
  // See https://stackoverflow.com/a/432503/638546
  var urls = [];
  var collector = new RegExp(COLLECT_IMAGE_URLS);
  var match = collector.exec(markdown);
  while (match !== null) {
    // match[0] is the entire matched string
    // match[1] is the first captured string
    urls.push(match[1]);
    match = collector.exec(markdown);
  }
  return urls;
};

exports.strip = function (markdown) {
  return markdown.replace(COLLECT_IMAGE_URLS, '');
};
