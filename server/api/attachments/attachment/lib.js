const path = require('path');

exports.appendToFilename = (absPath, postfix) => {
  const parts = path.parse(absPath);
  return path.join(parts.dir, parts.name + postfix + parts.ext);
};
