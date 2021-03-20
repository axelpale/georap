// Component to switch tabs.
//
var template = require('./template.ejs');
var emitter = require('component-emitter');

module.exports = function () {
  // Init

  var self = this;
  emitter(self);
  var $mount = null;

  // mapping: tab hash to tab class
  var tabs = {
    'activity': 'activity',
    'locations': 'locations',
    'posts': 'posts',
  };
  var defaultHash = 'activity';

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      tabs: tabs,
    }));

    // Make current tab active
    var tabClass = tabs[this.getTabHash()];
    $mount.find('.latest-tab-' + tabClass).addClass('active');

    // Click tab to change tab
    var tabSwitcher = function (tabHash) {
      return function () { // receives click ev
        $mount.find('li').removeClass('active');
        $mount.find('.latest-tab-' + tabs[tabHash]).addClass('active');
        self.emit('tab_switch', tabHash);
        // Setting the has is unnecessary because anchors do that by default.
        // Yet, it is possible to do so:
        // window.location.hash = '#' + tabHash;
      };
    };
    Object.keys(tabs).forEach(function (tabHash) {
      $mount.find('.latest-tab-' + tabs[tabHash]).click(tabSwitcher(tabHash));
    });
  };

  this.getTabHash = function () {
    var rawHash = window.location.hash || '#';
    var hash = rawHash.substring(1);
    return hash || defaultHash;
  };

  this.unbind = function () {
    $mount = null;
  };
};
