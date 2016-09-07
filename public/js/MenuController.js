var Emitter = require('component-emitter');
var MenuModel = require('./MenuModel');
var MenuView = require('./MenuView');
var LoginFormController = require('./LoginFormController');
var SearchController = require('./SearchController');

module.exports = function (map, card, auth) {
  // Parameters:
  //   map
  //     instance of google.maps.Map
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
    'public': [
      {
        label: 'Login',
        action: function () {
          new LoginFormController(card, auth);
        }
      }
    ],
    'private': [
      {
        label: 'Search',
        action: function () {
          new SearchController(card);
        }
      },
      {
        label: 'Add',
        action: function () {
          /*(function defineAddButton() {
            var b = document.createElement('button');
            b.className = 'btn btn-default';
            b.innerHTML = 'Add';
            menuDiv.appendChild(b);

            b.addEventListener('click', function () {
              var m = new google.maps.Marker({
                position: map.getCenter(),
                title: 'New location',
                draggable: true,
                animation: google.maps.Animation.DROP
              });
              m.setMap(map);
            });
          }());*/
        }
      },
      {
        label: 'Account',
        action: function () {
          card.open('/account');
        }
      },
      {
        label: 'Logout',
        action: function () {
          auth.logout();
        }
      }
    ]
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
