var $mount = null;

exports.bind = function ($mountEl, view) {
  $mount = $mountEl;
  // Max compatibility: call render method if available.
  if ('render' in view) {
    $mount.html(view.render());
  } else {
    $mount.empty();
  }
};

exports.unbind = function () {
  if ($mount) {
    $mount.empty();
    $mount = null;
  }
};
