exports.bind = function ($mount, view) {
  // Max compatibility: call render method if available.
  if ('render' in view) {
    $mount.html(view.render());
  } else {
    $mount.empty();
  }
};

exports.unbind = function ($mount) {
  $mount.empty();
};
