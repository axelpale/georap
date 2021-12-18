// This Store takes care of reading and storing the user language preference
// to a given storage, e.g. localStorage.
//
// The structure of the state:
//   {
//     locale: <string>,
//   }
//
// API
//   Constructor
//     createStore(storage, storageKey, defaultState)
//   Methods
//     update(stateDelta, opts)
//     reset()
//     isDefault()
//     isEmpty()
//     get()
//   Emits
//     'updated' with state
//
var cookies = require('georap-cookie');
var request = require('./lib/request');

exports.getLocale = function () {
  var locale = cookies.getCookie('locale');

  if (locale) {
    return locale;
  }
  return georap.config.defaultLocale;
};

exports.switchLocale = function (locale, callback) {
  // Fetch locale and replace current client-side translations.
  // TODO update cookie?
  //
  // Parameters:
  //   locale
  //     string, e.g. 'en'
  //   callback
  //     fn (err)
  //
  request.getJSON({
    url: '/api/locales/' + locale,
  }, function (err, reply) {
    // Reply is a { locale: <string>, catalog: <object> }
    if (err) {
      return callback(err);
    }

    // Replace translation dictionary
    georap.i18n.locale = reply.locale;
    georap.i18n.catalog = reply.catalog;

    return callback();
  });
};
