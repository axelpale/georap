/* eslint-disable no-var */
var template = require('./template.ejs')

module.exports = function (opts) {
  //
  // Parameters:
  //   opts
  //     text
  //       optional string. Alternative text for screen readers.
  //
  if (!opts) {
    opts = {}
  }
  opts = Object.assign({
    text: 'Waiting for server'
  }, opts)

  // Setup
  var $mount = null
  var self = this

  self.bind = function ($mountEl) {
    $mount = $mountEl

    $mount.html(template({
      text: opts.text
    }))
  }

  self.unbind = function () {
    if ($mount) {
      $mount.empty()
      $mount = null
    }
  }
}
