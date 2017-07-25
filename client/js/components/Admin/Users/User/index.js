// User Management UI

var admin = tresdb.stores.admin;
var ui = tresdb.ui;
var template = require('./template.ejs');
var BlacklistComponent = require('./Blacklist');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
var emitter = require('component-emitter');

module.exports = function (username) {

  // Init
  var self = this;
  emitter(self);

  // Components
  var blacklistComp, roleComp, eventsComp;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template({
      username: username,
    }));

    var $blacklistRoot = $('#tresdb-admin-user-blacklist-root');
    var $eventsRoot = $('#tresdb-admin-user-events-root');
    var $loading = $('#tresdb-admin-user-loading');
    var $roleRoot = $('#tresdb-admin-user-role-root');

    // Fetch users and include to page.
    ui.show($loading);
    admin.getUser(username, function (err, user) {
      // Hide loading bar
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Construct and bind child components
      blacklistComp = new BlacklistComponent(user);
      eventsComp = new EventsComponent(user);
      roleComp = new RoleComponent(user);

      blacklistComp.bind($blacklistRoot);
      eventsComp.bind($eventsRoot);
      roleComp.bind($roleRoot);
    });
  };


  self.unbind = function () {
    eventsComp.unbind();
    roleComp.unbind();
  };

};
