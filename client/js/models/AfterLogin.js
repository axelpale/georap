
module.exports = function () {
  // To redirect user to correct page after login, we might need to
  // remember what page user first requested.

  var DEFAULT_PATH = '/';
  var path = DEFAULT_PATH;

  this.get = function () {
    return path;
  };

  this.set = function (ctx) {
    path = ctx.canonicalPath;
  };

  this.reset = function () {
    path = DEFAULT_PATH;
  };
};
