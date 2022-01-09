var catalog = georap.i18n.catalog;

exports.__ = function (key, key2) {
  // Parameters
  //   key
  //     string, a translation key to be searched from the catalog
  //   key2
  //     optional string, a secondary translation key if the first key
  //     is a namespace for translations.
  //
  // Return
  //   string, the translated string
  //        or the given key if no translation found.
  //
  var tr = catalog[key];
  if (tr) {
    if (typeof tr === 'object') {
      if (key2) {
        return tr[key2] || key2;
      }
      return key;
    }
    // else assume string
    return tr;
  }
  return key;
};
