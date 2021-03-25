// Component to switch tabs.
//
var template = require('./template.ejs');
var emitter = require('component-emitter');

// Remember which tab was open
var defaultTabHash = 'activity';
var tabHashMemory = null;

module.exports = function () {
  // Init

  var self = this;
  emitter(self);
  var $mount = null;

  // mapping: tab hash to tab class
  var tabs = {
    activity: 'activity',
    locations: 'locations',
    posts: 'posts',
  };

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
      return function (ev) { // receives click ev
        // No link navigation needed.
        ev.preventDefault();
        // Display active tab
        $mount.find('li').removeClass('active');
        $mount.find('.latest-tab-' + tabs[tabHash]).addClass('active');
        // Remember the tab for next time Tabs is bound.
        tabHashMemory = tabHash;
        // Inform about tab switch
        self.emit('tab_switch', tabHash);
      };
    };
    Object.keys(tabs).forEach(function (tabHash) {
      $mount.find('.latest-tab-' + tabs[tabHash]).click(tabSwitcher(tabHash));
    });
  };

  this.getTabHash = function () {
    return tabHashMemory || defaultTabHash;
  };

  this.unbind = function () {
    $mount = null;
  };
};
