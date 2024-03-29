
var template = require('./template.ejs');
var detailsTemplate = require('./details.ejs');
var emitter = require('component-emitter');
var markdownToHtml = require('georap-ui').markdownToHtml;

var BatchList = function () {
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

  this.getSelectedIndices = function () {
    var $boxes = $('#georap-batch-table tbody input[name="row-check"]:checked');
    var $vals = $boxes.map(function (i, elem) {
      return parseInt(elem.value, 10);
    });
    return $vals.toArray();
  };

  this.countSelected = function () {
    var $boxes = $('#georap-batch-table tbody input[name="row-check"]:checked');
    return $boxes.length;
  };

  this.countLocations = function () {
    return this.state.locs.length;
  };

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

    self.emit('changed');
  };

  this.bind = function ($mount) {
    self.$mount = $mount;

    $mount.html(template({
      locs: self.state.locs,
      __: georap.i18n.__,
    }));

    var $checkAllBox = $('#georap-batch-select-all');
    var $list = $('#georap-batch-table');

    $checkAllBox.change(function () {
      var $rows = $('#georap-batch-table .georap-batch-row-check');
      var checked = $checkAllBox.prop('checked');
      $rows.prop('checked', checked);
    });

    $list.on('click', '.georap-batch-view-details', function (ev) {
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
        $tr.after(detailsTemplate({
          location: loc,
          markdownToHtml: markdownToHtml,
          __: georap.i18n.__,
        }));
        ev.target.dataset.isopen = 1;
      }
    });

    $list.on('change', '.georap-batch-row-check', function (ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation();

      self.emit('changed');
    });
  };

  this.unbind = function () {
    $('#georap-batch-select-all').off();
    $('#georap-batch-table').off();
  };

};

module.exports = BatchList;
