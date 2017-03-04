
var users = require('../../stores/users');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  emitter(this);

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template());

    // Fetch users and include to page.
    users.getAll(function (err, rawUsers) {
      // Hide loading bar
      $('#tresdb-users-loading').addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      // Reveal list
      $('#tresdb-users').html(listTemplate({
        users: rawUsers,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
