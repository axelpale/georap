module.exports = function (entries) {
  // Parameters:
  //   entries
  //     an array of entries
  //

  this.bind = function ($mount) {
    entries.forEach(function (entry) {
      $mount.append('<div id="' + entry.id + '">' + entry.markdown + '</div>');
    });
  };

  this.unbind = function () {

  };

};
