
var template = require('./template.ejs');
var detailsTemplate = require('./details.ejs');
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

    var $checkAllBox = $('#tresdb-batch-all');
    var $list = $('#tresdb-batch-list');

    $checkAllBox.change(function () {
      var $rows = $('#tresdb-batch-list .tresdb-batch-row-check');
      $rows.prop('checked', this.checked);
    });

    $list.on('click', '.tresdb-batch-view-details', function (ev) {
      ev.preventDefault();
      // plain stopPropagation fires the event twice
      ev.stopImmediatePropagation();

      var $tr = $(ev.target).parent().parent();
      var index = parseInt(ev.target.dataset.index, 10);
      var isopen = parseInt(ev.target.dataset.isopen, 10);
      var loc = self.state.locs[index];

      if (isopen === 1) {
        $tr.next().remove();
        ev.target.dataset.isopen = 0;
      } else {
        $tr.after(detailsTemplate(loc));
        ev.target.dataset.isopen = 1;
      }
    });
  };

  this.unbind = function () {
    $('#tresdb-batch-all').off();
    $('#tresdb-batch-list').off();
  };

};
