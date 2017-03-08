
var account = require('../../stores/account');
var template = require('./template.ejs');
var glyphiconTemplate = require('./glyphicon.ejs');
var emitter = require('component-emitter');

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
  var self = this;
  emitter(self);

  var go = handlers.go;

  // Root element. Remember for the unbinding.
  var _$root = null;

  // Public methods

  self.bind = function ($mount) {
    // Add listeners to the rendered menu.
    //
    // Parameters:
    //   $mount
    //     The point where one should listen the events.
    //     The existence of this point in DOM is required even though
    //     it contents can be dynamically modified later, including
    //     the buttons to bind events to.

    $mount.html(template({
      glyphicon: glyphiconTemplate,
      user: account.getUser(),  // might be undefined
    }));

    _$root = $mount;

    $mount.on('click', '#tresdb-mainmenu-events', function (ev) {
      ev.preventDefault();

      return go('/latest');
    });

    $mount.on('click', '#tresdb-mainmenu-payments', function (ev) {
      ev.preventDefault();

      return go('/payments');
    });

    $mount.on('click', '#tresdb-mainmenu-change-password', function (ev) {
      ev.preventDefault();

      return go('/password');
    });

    $mount.on('click', '#tresdb-mainmenu-users', function (ev) {
      ev.preventDefault();

      return go('/users');
    });

    $mount.on('click', '#tresdb-mainmenu-invite', function (ev) {
      ev.preventDefault();

      return go('/invite');
    });

    $mount.on('click', '#tresdb-mainmenu-logout', function (ev) {
      ev.preventDefault();

      return go('/login');
    });

    $mount.on('click', '#tresdb-mainmenu-add', function (ev) {
      ev.preventDefault();

      // Hide other menus
      $('#tresdb-toolbar-main').addClass('hidden');
      // Show addition menu
      $('#tresdb-toolbar-addition').removeClass('hidden');

      return handlers.onAdditionStart();
    });

    $mount.on('click', '#tresdb-addition-cancel', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-main').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCancel();
    });

    $mount.on('click', '#tresdb-addition-create', function (ev) {
      ev.preventDefault();

      // Show other menus
      $('#tresdb-toolbar-main').removeClass('hidden');
      // Hide addition menu
      $('#tresdb-toolbar-addition').addClass('hidden');

      return handlers.onAdditionCreate();
    });

    $mount.on('click', '#tresdb-mainmenu-filters', function (ev) {
      ev.preventDefault();
      return go('/filters');
    });

    $mount.on('submit', '#tresdb-mainmenu-search-form', function (ev) {
      ev.preventDefault();

      var searchText = $('#tresdb-mainmenu-search-text').val().trim();
      return go('/search?text=' + searchText);
    });

    $mount.on('click', '#tresdb-mainmenu-export', function (ev) {
      ev.preventDefault();
      return go('/export');
    });
  };

  self.unbind = function () {
    if (_$root !== null) {
      _$root.off('click');
    }
  };
};
