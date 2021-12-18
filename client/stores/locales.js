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
var createStore = require('./lib/createStore');
var storage = require('../connection/storage');
var request = require('./lib/request');

var DEFAULT_STATE = {
  locale: georap.config.defaultLocale,
};

var localeStore = createStore(storage, 'georap-locale', DEFAULT_STATE);

exports.getLocale = function () {
  return localeStore.get().locale;
};

exports.setLocale = function (locale, callback) {
  // Fetch locale and replace current client-side translations.
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

    localeStore.update({
      locale: reply.locale,
    });

    // Replace translation dictionary
    georap.i18n.locale = reply.locale;
    georap.i18n.catalog = reply.catalog;

    return callback();
  });
};
