/* eslint-disable no-var */
// General Error component.
// Dismissable bootstrap alert.
//
var template = require('./template.ejs')

module.exports = function (message, alertClass) {
  // Entry form View.
  //
  // Parameters
  //   message
  //     optional string. Empty '' by default.
  //   alertClass
  //     optional string. Bootstrap contextual color. Default 'danger'.
  //
  if (!message) {
    message = ''
  }
  if (typeof alertClass !== 'string') {
    alertClass = 'danger'
  }

  var $mount = null
  var self = this

  self.bind = function ($mountEl) {
    $mount = $mountEl

    if (message) {
      $mount.html(template({
        message: message,
        alertClass: alertClass
      }))
    }
  }

  self.update = function (newMessage, newAlertClass) {
    // Parameters
    //   newMessage
    //     string
    //   newAlertClass
    //     optional string. Bootstrap contextual color. Default 'danger'
    //
    //
    if (typeof newMessage !== 'string') {
      newMessage = ''
    }
    if (typeof newAlertClass !== 'string') {
      newAlertClass = 'danger'
    }

    message = newMessage
    alertClass = newAlertClass

    if ($mount) {
      $mount.html(template({
        message: message,
        alertClass: alertClass
      }))
    }
  }

  self.close =
  self.reset = function () {
    if ($mount) {
      $mount.empty()
    }
  }

  self.unbind = function () {
    if ($mount) {
      $mount.empty()
      $mount = null
    }
  }
}
