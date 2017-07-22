// User Management UI

var users = tresdb.stores.users;
var ui = tresdb.ui;
var template = require('./template.ejs');
var EventsComponent = require('./Events');
var ExpirationComponent = require('./Expiration');
var RoleComponent = require('./Role');
var emitter = require('component-emitter');

module.exports = function (username) {

  // Init
  var self = this;
  emitter(self);

  // Components
  var roleComp;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template({
      username: username,
    }));

    var $eventsRoot = $('#tresdb-admin-user-events-root');
    var $expirationRoot = $('#tresdb-admin-user-expiration-root');
    var $loading = $('#tresdb-admin-user-loading');
    var $roleRoot = $('#tresdb-admin-user-role-root');

    // Fetch users and include to page.
    ui.show($loading);
    users.getOneWithEvents(username, function (err, user) {
      // Hide loading bar
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Construct and bind child components
      eventsComp = new EventsComponent(user);
      expirationComp = new ExpirationComponent(user);
      roleComp = new RoleComponent(user);

      eventsComp.bind($eventsRoot);
      expirationComp.bind($expirationRoot);
      roleComp.bind($roleRoot);
    });
  };


  self.unbind = function () {
    eventsComp.unbind();
    expirationComp.unbind();
    roleComp.unbind();
  };

};
