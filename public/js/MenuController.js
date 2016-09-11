var Emitter = require('component-emitter');
var MenuModel = require('./MenuModel');
var MenuView = require('./MenuView');
var LoginFormController = require('./LoginFormController');
var SearchController = require('./SearchController');

var templates = {
  public: require('../templates/menus/public.ejs'),
  // login

  private: require('../templates/menus/private.ejs'),
  // search, list, add
  // account, logout

  admin: require('../templates/menus/admin.ejs')
  // search, list, add
  // account, logout
  // invite
};

// on event set menu. Choose template and define actions


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

  var model = new MenuModel();
  var view = new MenuView(map, model);

  // Predefined menus. A mapping from label to action.
  var menus = {
    'public': {
      template: templates.public,
      onclicks: {
        login: function () {
          new LoginFormController(card, auth);
        }
      }
    },
    'private': {
      template: templates.private,
      onclicks: {
        search: function () {},
        list: function () {},
        add: function () {},
        account: function () {},
        logout: function () {
          auth.logout();
        }
      }
    },
    'admin': {
      extends: 'private',
      template: templates.admin,
      onclicks: {
        invite: function () {}
      }
    }
  };

  // Initial menu
  if (auth.hasToken()) {
    model.setMenu(menus.private);
  } else {
    model.setMenu(menus.public);
  }

  // Listen if the menu needs to be changed.

  auth.on('login', function () {
    model.setMenu(menus.private);
  });
  auth.on('logout', function () {
    // Replace menu with a public one.
    model.setMenu(menus.public);
  });
};
