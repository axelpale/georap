
var timestamp = require('../lib/timestamp');
var template = require('./attachment.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     any in models.entries

  // Private methods


  // Public methods

  this.render = function () {
    return template({
      entry: entry,
      timestamp: timestamp,
    });
  };

  this.bind = function () {
    // noop
  };

  this.unbind = function () {
    // noop
  };

};
