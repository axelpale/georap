
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
    });
  };

  this.bind = function () {
    throw new Error('not implemented');
  };


  // Private methods

};
