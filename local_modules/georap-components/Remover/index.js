
var Opener = require('../Opener')
var ErrorViewer = require('../Error')
var RemoverPanel = require('./RemoverPanel')
var ui = require('georap-ui')
var emitter = require('component-emitter')
var template = require('./template.ejs')

module.exports = function (params) {
  // Removal button and confirmation.
  //
  // Parameters:
  //   params, with required props
  //     cancelBtnText
  //       string
  //     deleteBtnText
  //       string
  //     infoText
  //       string
  //     youSureText
  //       string
  //
  // Emit
  //   submit
  //     on confirmed deletion attempt
  //
  var $container = null
  var $button = null
  var opener = null
  var errorViewer = null
  var self = this
  emitter(self)

  self.bind = function (mounts) {
    $container = mounts.$container
    $button = mounts.$button

    // Render containers for panel and errors.
    $container.html(template())
    // Ensure container not hidden.
    ui.show($container)

    var panel = new RemoverPanel({
      cancelBtnText: params.cancelBtnText,
      deleteBtnText: params.deleteBtnText,
      infoText: params.infoText,
      youSureText: params.youSureText
    })
    opener = new Opener(panel, false)
    opener.bind({
      $container: $container.find('.remover-panel-container'),
      $button: $button
    })

    // Forward RemoverPanel submit
    opener.on('submit', function (ev) {
      if (ev) {
        ev.preventDefault() // in case of submit button event is passed
      }
      self.emit('submit', ev)
    })
  }

  self.close = function () {
    // Close the panel and button states and errors
    if (opener) {
      opener.close()
    }
    if (errorViewer) {
      errorViewer.unbind()
      errorViewer = null
    }
  }

  self.error = function (message, alertClass) {
    // Replaces the remover panel and displays a dismissable error message
    // instead.
    //
    // Parameters
    //   message
    //     string
    //   alertClass
    //     optional string, bootstrap contextual color. Defaults to 'danger'
    //
    if (typeof alertClass !== 'string') {
      alertClass = 'danger'
    }

    if ($container) {
      // Ensure panel closed
      if (opener) {
        opener.close()
      }

      // Ensure error container visible
      var $errorCont = $container.find('.remover-error-container')
      ui.show($errorCont)

      // Update or bind
      if (errorViewer) {
        errorViewer.update(message, alertClass)
      } else {
        errorViewer = new ErrorViewer(message, alertClass)
        errorViewer.bind($errorCont)
      }
    }
  }

  self.unbind = function () {
    if (opener) {
      opener.off('submit')
      opener.unbind()
      opener = null
      $container = null
      $button = null
    }
    if (errorViewer) {
      errorViewer.unbind()
      errorViewer = null
    }
  }
}
