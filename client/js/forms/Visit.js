// Usage:
//   var s = new Story(api, auth);
//   s.render(node);
//   s.bind();

var timestamp = require('./lib/timestamp');
var visitTemplate = require('../../templates/entries/visit.ejs');

module.exports = function (entryModel, accountModel, api) {

  // Private methods


  // Public methods

  this.render = function () {
    return visitTemplate({
      entry: entryModel,
      timestamp: timestamp,
    });
  };

  this.bind = function () {
    // noop
  };

};
