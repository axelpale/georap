// A meta-component that binds component creation to
// a button element and a container element.
//
var ui = require('georap-ui');
var emitter = require('component-emitter');

module.exports = function (component, isOpen) {
  // Parameters
  //   component
  //     a constructed but still unbound component instance
  //   isOpen
  //     optional initial openness state
  //
  if (typeof isOpen !== 'boolean') {
    isOpen = false;
  }

  // Setup
  var self = this;
  var $container = null;
  var $button = null;
  emitter(self);

  this.bind = function (mounts) {
    // Parameters
    //   mounts, object with props
    //     $container
    //       jquery object, empty container element
    //     $button
    //       jquery object, a button
    //
    $container = mounts.$container;
    $button = mounts.$button;

    // Set default open state
    if (isOpen) {
      ui.show($container);
    } else {
      ui.hide($container);
    }

    // Opener click handler with double-click prevention
    $button.click(ui.throttle(1000, function (ev) {
      ev.preventDefault(); // if element is button-like anchor

      // Close if open. Unbind only component, do not unbind complete opener.
      if (!ui.isHidden($container)) {
        ui.hide($container);
        component.unbind();
        return;
      }

      // Render component
      component.bind($container);
      // Ensure container is visible
      ui.show($container);

      if (typeof component.on === 'function') {
        // Listen for cancel events
        component.on('cancel', function () {
          if ($container) { // ensure opener is bound
            ui.hide($container);
            component.unbind();
          }
        });
        // Bubble submit events
        component.on('submit', function (ev) {
          self.emit('submit', ev);
        });
      }
    }));
  };

  this.close = function () {
    // Set default open state
    if ($container) {
      ui.hide($container);
      component.unbind();
    }
  };

  this.unbind = function () {
    // Unbind the opener binding and internal component bindings.
    if (typeof component.off === 'function') {
      component.off('cancel');
    }
    component.unbind();

    if ($button) {
      $button.off();
      $button = null;
    }
    if ($container) {
      $container.empty();
      $container = null;
    }
  };
};
