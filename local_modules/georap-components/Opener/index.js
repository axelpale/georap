// A meta-component that binds component creation to
// a button element and a container element.
//
var ui = require('georap-ui');

module.exports = function (Component, isOpen) {
  // Parameters
  //   Component
  //     a component class
  //   isOpen
  //     optional initial openness state
  //
  if (typeof isOpen !== 'boolean') {
    isOpen = false;
  }

  // Setup
  var $container = null;
  var $button = null;
  var component = null;

  this.bind = function ($containerEl, $buttonEl) {
    $container = $containerEl;
    $button = $buttonEl;

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
      if (component) {
        ui.hide($container);
        component.unbind();
        component = null;
        return;
      }

      // Render component
      component = new Component();
      component.bind($container);
      // Ensure container is visible
      ui.show($container);

      // Listen for cancel events
      if ('on' in component) {
        component.on('cancel', function () {
          if ($container && component) {
            ui.hide($container);
            component.unbind();
            component = null;
          }
        });
      }
    }));

  };

  this.unbind = function () {
    // Unbind the opener binding and internal component bindings.
    if (component) {
      if ('off' in component) {
        component.off('cancel');
      }
      component.unbind();
      component = null;
    }
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
