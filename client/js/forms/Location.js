var marked = require('marked');
var timestamp = require('./lib/timestamp');

// Templates
var locationTemplate = require('../../templates/forms/location.ejs');

module.exports = function (loc) {
  // Parameters
  //   loc
  //     Location object

  // Init

  // Sort content, newest first, create-event to bottom.
  loc.content.sort(function comp(a, b) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time > b.time) {
      return -1;
    }
    if (a.type === 'created') {
      return 1;
    }
    return 0;
  });

  // Private methods declaration

  // Public methods

  this.render = function () {

    return locationTemplate({
      location: loc,
      marked: marked,
      timestamp: timestamp,
    });
  };

  this.bind = function () {
    throw new Error('not implemented');
  };


  // Private methods

};
