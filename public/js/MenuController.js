var Emitter = require('component-emitter');
var MenuModel = require('./MenuModel');
var MenuView = require('./MenuView');
var LoginFormController = require('./LoginFormController');
var InviteFormController = require('./InviteFormController');
var ChangePasswordController = require('./ChangePasswordController');

var publicTemplate = require('../templates/menus/public.ejs');
var privateTemplate = require('../templates/menus/private.ejs');

module.exports = function (map, card, auth) {
  // Parameters:
  //   map
  //     instance of MapController. To insert menu.
  //   card
  //     Instance of CardController. To open cards.
  //   auth
  //     Instance of AuthController. Is listened for logout and login events.
  //

  Emitter(this);
  var model, view, menus;  // eslint-disable-line no-unused-vars

  model = new MenuModel();
  view = new MenuView(map, model);

  // Predefined menus. A mapping from label to action.
  menus = {
    'public': {
      template: publicTemplate,
      onclicks: {
        login: function () {
          new LoginFormController(card, auth);  // eslint-disable-line no-new
        },
      },
    },
    'private': {
      template: privateTemplate,
      onclicks: {
        //search: function () {},
        //list: function () {},
        //add: function () {},
        password: function (ev) {
          ev.preventDefault();
          // eslint-disable-next-line no-new
          new ChangePasswordController(card, auth);
        },
        invite: function (ev) {
          ev.preventDefault();
          new InviteFormController(card, auth);  // eslint-disable-line no-new
        },
        logout: function (ev) {
          ev.preventDefault();
          auth.logout();
        },
      },
    },
  };

  // Initial menu
  if (auth.hasToken()) {
    model.setMenu(menus.private, auth.getPayload());
  } else {
    model.setMenu(menus.public);
  }

  // Listen if the menu needs to be changed.

  auth.on('login', function () {
    model.setMenu(menus.private, auth.getPayload());
  });
  auth.on('logout', function () {
    // Replace menu with a public one.
    model.setMenu(menus.public);
  });
};
