var mainmenuTemplate = require('../../templates/menus/mainmenu.ejs');
var glyphiconTemplate = require('../../templates/glyphicon.ejs');

module.exports = function (auth, go) {
  // Parameters:
  //   auth
  //     instance of auth.Service
  //   go
  //     function go(path): ask router to go to path. Is a way to expose the
  //     router for the menu.


  // Public methods

  this.render = function () {
    // Return
    //   HTML as string

    // Render menu
    return mainmenuTemplate({
      glyphicon: glyphiconTemplate,
      user: auth.getUser(),  // might be undefined
    });
  };

  this.bind = function (rootElement) {
    // Add listeners to the rendered menu.
    //
    // Parameters:
    //   rootElement
    //     The point where one should listen the events.
    //     The existence of this point in DOM is required even though
    //     it contents can be dynamically modified later, including
    //     the buttons to bind events to.

    var r = $(rootElement);

    r.on('click', '#tresdb-mainmenu-change-password', function (ev) {
      ev.preventDefault();

      return go('/password');
    });

    r.on('click', '#tresdb-mainmenu-invite', function (ev) {
      ev.preventDefault();

      return go('/invite');
    });

    r.on('click', '#tresdb-mainmenu-logout', function (ev) {
      ev.preventDefault();

      return go('/login');
    });
  };
};
