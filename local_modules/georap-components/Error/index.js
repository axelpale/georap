/* eslint-disable no-var */
// General Error component.
// Dismissable bootstrap alert.
//
var template = require('./template.ejs')

module.exports = function (message) {
  // Entry form View.
  //
  // Parameters
  //   message
  //     optional string. Empty '' by default.
  //
  if (!message) {
    message = ''
  }

  var $mount = null
  var self = this

  self.bind = function ($mountEl) {
    $mount = $mountEl

    if (message) {
      $mount.html(template({
        message: message
      }))
    }
  }

  self.update = function (newMessage) {
    message = newMessage
    if ($mount) {
      $mount.html(template({
        message: message
      }))
    }
  }

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
