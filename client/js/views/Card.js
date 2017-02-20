// Card
//
// Provides a container for page-like views.
//
// Interface:
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
var emitter = require('component-emitter');

module.exports = function () {

  // Constants
  var $layer = $('#card-layer');
  var $bg = $('#card-background');
  var $cont = $('#card-container');

  // State
  var activeView = null;

  // Init
  emitter(this);
  var self = this;

  // Init close mechanism
  $bg.click(function () {
    self.close();
  });


  // Public methods

  this.open = function (view, cardClass) {
    // Open a card over the map and close any other open cards.
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

    // Handle default parameters
    if (typeof cardClass === 'undefined') {
      cardType = 'page';
    } else {
      cardType = cardClass;
    }

    // Remove possible other cards
    if (activeView !== null) {
      activeView.off();
      activeView.unbind();
    }
    activeView = view;

    // Activate view.
    // Backwards compatibility: call render method if available.
    if ('render' in view) {
      $cont.html(view.render());
    } else {
      $cont.empty();
    }
    $cont.removeClass();  // removes previous tresdb-card-* classes
    $cont.addClass('tresdb-card-' + cardType);
    view.bind($cont);

    // Reveal if hidden
    $layer.removeClass('hidden');

    // Listen & close if the model of the view becomes removed.
    view.once('removed', function () {
      self.close();
    });

    self.emit('opened');
  };

  this.close = function (silent) {
    // Parameters:
    //   silent, optional, default false
    //     prevent emitting of 'closed' event
    if (typeof silent !== 'boolean') {
      silent = false;
    }

    if (activeView !== null) {
      activeView.off();
      activeView.unbind();
      activeView = null;
    }

    $layer.addClass('hidden');
    $cont.empty();

    if (!silent) {
      self.emit('closed');
    }
  };

};
