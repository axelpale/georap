var marked = require('marked');
var timestamp = require('./lib/timestamp');

// Templates
var locationTemplate = require('../../templates/forms/location.ejs');

module.exports = function (loc) {
  // Parameters
  //   loc
  //     Location object

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
