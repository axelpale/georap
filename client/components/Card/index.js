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
var emitter = require('component-emitter');
var closeButton = require('./closeButton');
var ui = require('georap-ui');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // State
  var component = null;
  var $mount = null;
  var $elems = {};

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $elems.container = $mount.find('.card-layer-content');
  };

  self.unbind = function () {
    if ($mount) {
      // $mount.empty();
      $mount = null;
    }
    if (component) {
      component.off();
      component.unbind();
      component = null;
    }
  };

  self.isViewInstanceOf = function (View) {
    // Test if the active view is of the class View.
    return (component instanceof View);
  };

  self.open = function (nextComponent, cardClass) {
    // Open a card over the map and close any other open cards.
    // The bind() must be called before open().
    //
    // Parameters:
    //   nextComponent
    //     to be rendered inside the card
    //   cardClass
    //     string, optional. Card type. Available types:
    //       half
    //         Half of the map is visible
    //       medium (default)
    //         A fraction of the map is visible.
    //       full
    //         Fills the map area completely.
    //

    // Handle default parameters
    var cardType;
    if (typeof cardClass === 'undefined') {
      cardType = 'medium';
    } else {
      cardType = cardClass;
    }

    if ($mount === null) {
      throw new Error('Fn open() called before bind()');
    }

    // Remove possible other cards
    if (component) {
      component.off();
      component.unbind();
    }
    // Switch active component
    component = nextComponent;

    // removes previous card-* classes
    $mount.removeClass('card-full');
    $mount.removeClass('card-medium');
    $mount.removeClass('card-half');
    // set next class
    $mount.addClass('card-' + cardType);

    // Render view into card.
    component.bind($elems.container);

    // Reveal if hidden
    ui.show($mount);
    ui.show($elems.container);

    // Create close button (not created if not sidebar)
    closeButton($mount, cardType, function () {
      self.close();
    });

    // Listen & close if the model of the view becomes removed.
    component.once('removed', function () {
      self.close();
    });

    self.emit('opened');
  };

  self.close = function (silent) {
    // Parameters:
    //   silent, optional, default false
    //     prevent emitting of 'closed' event

    if ($mount === null) {
      throw new Error('Fn close() called on unbound component. ' +
                      'Call bind() first.');
    }

    if (typeof silent !== 'boolean') {
      silent = false;
    }

    if (component) {
      component.off();
      component.unbind();
      component = null;
    }

    ui.hide($mount);
    $elems.container.empty();

    if (!silent) {
      self.emit('closed');
    }
  };

};
