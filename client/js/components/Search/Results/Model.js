/* eslint-disable max-statements, max-lines */

var emitter = require('component-emitter');


module.exports = function (rawResults) {
  // Usage:
  //   var r = new Results(rawSearchResults);
  //
  // Parameters:
  //   rawResults
  //     Array of search results

  // Init
  var self = this;
  emitter(self);

  // Bind

  // Private methods

  // Public methods

  self.getRawResults = function () {
    return rawResults;
  };
};
