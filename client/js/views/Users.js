
var emitter = require('component-emitter');
var template = require('./Users.ejs');

module.exports = function (users) {
  // Parameters:
  //   users
  //     array of raw users from server

  // Init
  emitter(this);

  // Private methods declaration

  // Public methods

  this.render = function () {
    return template({
      users: users,
    });
  };

  this.bind = function () {
    // noop
  };

  this.unbind = function () {
    // noop
  };


  // Private methods


};
