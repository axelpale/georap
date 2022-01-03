// The flagstamp function.
// Published here and not under local_module because the dependency on
// the flag config and translation config.
//
var flagConfig = georap.config.entryFlags;
var __ = georap.i18n.__;

module.exports = function (flags) {
  // Convert an array of flags to string
  //
  var i, flag, out;
  if (flags && flags.length > 0) {
    // Translate flags
    out = '';
    for (i = 0; i < flags.length; i += 1) {
      flag = flags[i];
      out += __(flagConfig[flag].genitive);
      if (i < flags.length - 1) { // if not last
        out += ' ' + __('and') + ' ';
      }
    }
    return out;
  }
  return '';
};
