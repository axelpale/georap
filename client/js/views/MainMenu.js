var emitter = require('component-emitter');
var mainmenuTemplate = require('../../templates/menus/mainmenu.ejs');
var glyphiconTemplate = require('../../templates/glyphicon.ejs');

module.exports = function (auth, handlers) {
  // Parameters:
  //   auth
  //     instance of auth.Service
  //   handlers
  //     Object with the following properties:
  //       go
  //         function go(path): ask router to go to path. Is a way to expose
  //         the router for the menu.
  //       onAdditionStart
  //       onAdditionCreate
  //       onAdditionCancel

  // Init
  emitter(this);
  var go = handlers.go;

  // Root element. Remember for the unbinding.
  var r = null;

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

    r = $(rootElement);

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

    r.on('click', '#tresdb-mainmenu-add', function (ev) {
      ev.preventDefault();

      // Hide other menus
      $('#tresdb-toolbar-user').addClass('hidden');
      $('#tresdb-toolbar-tools').addClass('hidden');
      // Show addition menu
      $('#tresdb-toolbar-addition').removeClass('hidden');

      return handlers.onAdditionStart();
    });

    r.on('click', '#tresdb-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-user').removeClass('hidden');
      $('#tresdb-toolbar-tools').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCancel();
    });

    r.on('click', '#tresdb-addition-create', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-user').removeClass('hidden');
      $('#tresdb-toolbar-tools').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCreate();
    });
  };

  this.unbind = function () {
    if (r !== null) {
      r.off('click');
    }
  };
};
