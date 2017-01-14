
var timestamp = require('../lib/timestamp');
var template = require('../../../templates/entries/rename.ejs');

module.exports = function (entry) {

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

};
