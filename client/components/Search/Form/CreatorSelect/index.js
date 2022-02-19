var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var usersApi = georap.stores.users;
var account = georap.stores.account;

module.exports = function (query) {
  // Parameters
  //   query
  //     an object parsed from querystring
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    var myName = '';
    if (account.hasToken()) {
      myName = account.getName();
    }

    $mount.html(template({
      username: myName,
      __: georap.i18n.__,
    }));

    $elems.select = $mount.find('select.search-creator');

    // Load additional users into the created-by dropdown
    usersApi.getAll(function (err, users) {
      if (err) {
        // Fail quietly, not so important
        return;
      }

      // Visual separator
      $elems.select.append('<option disabled>───────</option>');

      // 1 Sort alphabetically.
      // 2 Exlude user's own name because it is there already.
      // 3 Add option element for each remaining user. Trim long names.
      users.sort(function (a, b) {
        return a < b ? 1 : -1;
      }).filter(function (u) {
        return u.name !== myName; // NOTE myName can be ''
      }).forEach(function (u) {
        var short = u.name;
        var LIMIT = 12;
        if (short.length > LIMIT) {
          short = u.name.substring(0, LIMIT) + '...';
        }
        var opt = '<option value="' + u.name + '">' + short + '</option>';
        $elems.select.append(opt);
      });

      // Reselect correct creator because these were just loaded.
      if ('creator' in query) {
        // Ensure that creator exists in list. User can typo
        var foundUser = null;
        for (var i = 0; i < users.length; i += 1) {
          if (query.creator === users[i].name) {
            foundUser = users[i];
          }
        }
        if (foundUser) {
          $elems.select.val(query.creator);
        }
      }
    });
  };

  self.value = function () {
    if ($mount) {
      return $elems.select.val();
    }
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
