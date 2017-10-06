
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self);

  this.state = {
    locs: [],
  };
  this.$mount = null;

  // Public methods

  this.setState = function (newState) {

    if (typeof newState === 'function') {
      self.state = newState(self.state);
    } else {
      self.state = newState;
    }

    if (self.$mount) {
      self.unbind();
      self.bind(self.$mount);
    }
  };

  this.bind = function ($mount) {
    self.$mount = $mount;

    $mount.html(template(self.state));

    var $checkAllBox = $('#tresdb-import-all');

    $checkAllBox.change(function () {
      var $rows = $('#tresdb-import-list .tresdb-import-row-check');
      $rows.prop('checked', this.checked);
    });
  };

  this.unbind = function () {
  };

};
