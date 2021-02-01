var template = require('./template.ejs');

module.exports = function (entry) {
  // Parameters:
  //   entry
  //     Entry model.

  var self = this;

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({
      entry: entry,
    }));

    entry.on('location_entry_changed', function () {
      // Rebind
      self.unbind();
      self.bind($mount);
    });
  };

  this.unbind = function () {
    entry.off();
  };
};
