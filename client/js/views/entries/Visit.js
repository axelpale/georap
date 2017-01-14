
var timestamp = require('../lib/timestamp');
var visitTemplate = require('../../../templates/entries/visit.ejs');

module.exports = function (entry) {

  // Private methods


  // Public methods

  this.render = function () {
    return visitTemplate({
      entry: entry,
      timestamp: timestamp,
    });
  };

  this.bind = function () {
    // noop

  };

};
