var template = require('./template.ejs')
var emitter = require('component-emitter')
var ui = require('georap-ui')

module.exports = function (params) {
  // Removal button and confirmation.
  //
  // Parameters:
  //   params, object with required props:
  //     cancelBtnText
  //       string
  //     deleteBtnText
  //       string
  //     infoText
  //       string
  //     youSureText
  //       string
  //
  // Emits:
  //   cancel
  //     on cancel button
  //   submit
  //     on confirmed deletion attempt
  //
  var $mount = null
  var $elems = {}
  var self = this
  emitter(self)

  self.bind = function ($mountEl) {
    $mount = $mountEl

    $mount.html(template({
      infoText: params.infoText,
      youSureText: params.youSureText,
      cancelBtnText: params.cancelBtnText,
      deleteBtnText: params.deleteBtnText
    }))

    $elems.confirmation = $mount.find('.form-remove-confirmation')
    $elems.progress = $mount.find('.form-remove-progress')

    $elems.cancelBtn = $mount.find('button.form-cancel-btn')
    $elems.cancelBtn.click(function () {
      self.emit('cancel')
    })

    $elems.removeBtn = $mount.find('button.form-remove-btn')
    $elems.removeBtn.click(function () {
      ui.hide($elems.confirmation)
      ui.show($elems.progress)
      self.emit('submit')
    })
  }

  self.reset = function () {
    if ($mount) {
      ui.hide($elems.confirmation)
      ui.hide($elems.progress)
    }
  }

  self.unbind = function () {
    if ($mount) {
      $mount = null
      ui.offAll($elems)
      $elems = {}
    }
  }
}
