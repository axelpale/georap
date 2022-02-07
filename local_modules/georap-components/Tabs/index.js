// Component to switch tabs.
//
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');

module.exports = function (params) {
  // Parameters:
  //   params
  //     tabs, array of tab objects with props
  //       key
  //         string
  //       title
  //         string
  //       className
  //         string
  //     defaultTab
  //       string, one of the tab keys
  //     storageKey
  //       string, to memorise which tab was open
  //

  // Init
  var self = this;
  emitter(self);
  var $mount = null;

  var defaultTabKey = params.defaultTab;
  var storageKey = params.storageKey;

  var loadTabKey = function () {
    var tabKey = window.localStorage.getItem(storageKey);
    if (tabKey) {
      return tabKey;
    }
    return defaultTabKey;
  };

  var saveTabKey = function (key) {
    window.localStorage.setItem(storageKey, key);
  };

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      tabs: params.tabs,
    }));

    // Make current tab active
    var currentTabKey = loadTabKey();
    var activeTab = params.tabs.find(function (t) {
      return t.key === currentTabKey;
    });
    $mount.find('.' + activeTab.className).addClass('active');

    // Click tab to change tab
    var createTabSwitcher = function (tab) {
      // Parameters
      //   tab
      //     object
      //
      // Return
      //   function (ev)
      //     a tab switcher
      return function (ev) { // receives click ev
        // No # link navigation needed.
        ev.preventDefault();
        // Display active tab
        $mount.find('li').removeClass('active');
        $mount.find('.' + tab.className).addClass('active');
        // Remember the tab for next time Tabs is bound.
        saveTabKey(tab.key);
        // Inform about tab switch
        self.emit('tab_switch', tab.key);
      };
    };
    // Bind the switcher to buttons
    params.tabs.forEach(function (tab) {
      var tabQuery = '.' + tab.className;
      var switchTab = createTabSwitcher(tab);
      var throttledSwitch = ui.throttle(1000, switchTab);
      // Prevent double click double load
      $mount.find(tabQuery).click(throttledSwitch);
    });
  };

  this.getTabKey = function () {
    if ($mount) {
      var activeTabEl = $mount.find('li.active').get(0); // undefined if empty
      if (activeTabEl) {
        return activeTabEl.dataset.tab;
      }
    }
    return '';
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
    }
  };
};
