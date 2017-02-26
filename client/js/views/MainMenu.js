var emitter = require('component-emitter');
var account = require('../stores/account');
var mainmenuTemplate = require('./MainMenu.ejs');
var glyphiconTemplate = require('./lib/glyphicon.ejs');

module.exports = function (handlers) {
  // Parameters:
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
      user: account.getUser(),  // might be undefined
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

    r.on('click', '#tresdb-mainmenu-events', function (ev) {
      ev.preventDefault();

      return go('/latest');
    });

    r.on('click', '#tresdb-mainmenu-change-password', function (ev) {
      ev.preventDefault();

      return go('/password');
    });

    r.on('click', '#tresdb-mainmenu-users', function (ev) {
      ev.preventDefault();

      return go('/users');
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
      $('#tresdb-toolbar-main').addClass('hidden');
      // Show addition menu
      $('#tresdb-toolbar-addition').removeClass('hidden');

      return handlers.onAdditionStart();
    });

    r.on('click', '#tresdb-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-main').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCancel();
    });

    r.on('click', '#tresdb-addition-create', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-main').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCreate();
    });

    r.on('click', '#tresdb-mainmenu-filters', function (ev) {
      ev.preventDefault();
      return go('/filters');
    });

    r.on('click', '#tresdb-mainmenu-search-submit', function (ev) {
      ev.preventDefault();

      var searchText = $('#tresdb-mainmenu-search-text').val().trim();
      return go('/search?text=' + searchText);
    });
  };

  this.unbind = function () {
    if (r !== null) {
      r.off('click');
    }
  };
};
