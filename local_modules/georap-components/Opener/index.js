// A meta-component that binds component creation to
// a button element and a container element.
//
const ui = require('georap-ui')
const emitter = require('component-emitter')
const REST = 800; // ms to wait after another click allowed

module.exports = function (component, opts) {
  // Parameters
  //   component
  //     a constructed but still unbound component instance
  //   opts, optional object with props
  //     isOpen
  //       boolean, optional initial openness state. Defaults to false.
  //     labelOpen
  //       string, optional button label to be shown when the component open.
  //         Requirement: you must specify also labelClosed.
  //     labelClosed
  //       string, optional button lable to be shown when the component closed.
  //         Requirement: you must specify also labelOpen.
  //
  // Emits
  //   opened
  //     when opener is opened
  //   submit
  //     when component emits submit
  //   success
  //     when component emits success
  //
  // Listens component events
  //   cancel
  //     closes the component
  //   finish
  //     closes the component
  //   submit
  //     bubbles submit
  //   success
  //     bubbles success
  //
  if (!opts) {
    opts = {}
  }
  opts = Object.assign({
    isOpen: false,
    labelOpen: null,
    labelClosed: null,
  }, opts)

  // Setup
  const self = this
  let $container = null
  let $button = null
  emitter(self)

  this.bind = function (mounts) {
    // Parameters
    //   mounts, object with props
    //     $container
    //       jquery object, empty container element
    //     $button
    //       jquery object, a button
    //
    $container = mounts.$container
    $button = mounts.$button

    // Set default open state
    if (opts.isOpen) {
      ui.show($container)
      if (opts.labelOpen) {
        $button.html(opts.labelOpen)
      }
    } else {
      ui.hide($container)
      if (opts.labelClosed) {
        $button.html(opts.labelClosed)
      }
    }

    // Opener click handler with double-click prevention
    $button.click(ui.throttle(REST, function (ev) {
      ev.preventDefault() // if element is button-like anchor

      // Close if open. Unbind only component, do not unbind complete opener.
      if (!ui.isHidden($container)) {
        self.close()
        return
      }

      // Open. Render component
      component.bind($container)
      // Ensure container is visible
      ui.show($container)
      // Set button label
      if (opts.labelOpen) {
        $button.html(opts.labelOpen)
      }

      self.emit('opened')
    }))

    if (typeof component.on === 'function') {
      // Listen for cancel events.
      // A cancel button was pressed in the open form and thus we auto-close.
      component.on('cancel', function () {
        self.close()
      })
      // Listen for finish events.
      // A finish button was pressed in the open form and thus we auto-close.
      component.on('finish', function () {
        self.close()
      })
      // Bubble submit events.
      // The open form might display progress bar. Do not auto-close.
      component.on('submit', function (ev) {
        self.emit('submit', ev)
      })
      // Bubble success events.
      // The open form might display success message. Do not auto-close.
      component.on('success', function (ev) {
        self.emit('success', ev)
      })
    }
  }

  this.close = function () {
    // Set default open state
    if ($container) {
      ui.hide($container)
      component.unbind()
      // Update button label
      if (opts.labelClosed) {
        $button.html(opts.labelClosed)
      }
    }
  }

  this.unbind = function () {
    // Unbind the opener binding and internal component bindings.
    if (typeof component.off === 'function') {
      component.off('cancel')
      component.off('submit')
      component.off('success')
    }
    component.unbind()

    if ($button) {
      $button.off()
      $button = null
    }
    if ($container) {
      $container.empty()
      $container = null
    }
  }
}
