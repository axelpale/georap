// Card
//
// Provides a container for page-like components.
//
// Interface:
//   bind($mount)
//   unbind()
//   open(view, cardClass?)
//     Closes previous view if open.
//     Calls view.bind(HTMLElement mountpoint)
//   close()
//     Calls view.unbind()
//
// Emits:
//   opened
//     after open
//   closed
//     after close
// Usage:
//   var card = new Card();
//   card.open(new Login());
//   card.close()
//

var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // State
  var _activeView = null;
  var _$mount = null;
  var _$cont = null;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template());

    // Update state
    _$mount = $mount;
    _$cont = $('#card-container');

    // Init close mechanism
    $('#card-background').click(function () {
      self.close();
    });

  };

  self.unbind = function () {
    $('#card-background').off();

    if (_activeView) {
      _activeView.off();
      _activeView.unbind();
      _activeView = null;
    }

    _$mount = null;
    _$cont = null;
  };

  self.open = function (view, cardClass) {
    // Open a card over the map and close any other open cards.
    // The bind() must be called before open().
    //
    // Parameters:
    //   view
    //     to be rendered inside the card
    //   cardClass
    //     string, optional. Card type. Available types:
    //       page (default)
    //         A fraction of the map is visible.
    //       full
    //         Fills the map area completely.
    var cardType;

    if (_$mount === null) {
      throw new Error('Fn open() called before bind()');
    }

    // Handle default parameters
    if (typeof cardClass === 'undefined') {
      cardType = 'page';
    } else {
      cardType = cardClass;
    }

    // Remove possible other cards
    if (_activeView !== null) {
      _activeView.off();
      _activeView.unbind();
    }
    _activeView = view;

    // Activate view.
    // Backwards compatibility: call render method if available.
    if ('render' in view) {
      _$cont.html(view.render());
    } else {
      _$cont.empty();
    }
    _$cont.removeClass();  // removes previous tresdb-card-* classes
    _$cont.addClass('tresdb-card-' + cardType);
    _activeView.bind(_$cont);

    // Reveal if hidden
    _$mount.removeClass('hidden');

    // Listen & close if the model of the view becomes removed.
    _activeView.once('removed', function () {
      self.close();
    });

    self.emit('opened');
  };

  self.close = function (silent) {
    // Parameters:
    //   silent, optional, default false
    //     prevent emitting of 'closed' event

    if (_$mount === null) {
      throw new Error('Fn close() called on unbound component. ' +
                      'Call bind() first.');
    }

    if (typeof silent !== 'boolean') {
      silent = false;
    }

    if (_activeView !== null) {
      _activeView.off();
      _activeView.unbind();
      _activeView = null;
    }

    _$mount.addClass('hidden');
    _$cont.empty();

    if (!silent) {
      self.emit('closed');
    }
  };

};
