var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template());

    $('#tresdb-theme').click(function (ev) {
      var themeName = ev.target.dataset.theme;
      if (themeName) {
        var linkEl = document.getElementById('theme-stylesheet');
        linkEl.setAttribute('href', '/assets/themes/' + themeName + '.css');
      }
      console.log(themeName);
    });
  };
  this.unbind = function () {
  };
};
