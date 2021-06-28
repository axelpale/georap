var template = require('./template.ejs');

module.exports = function ($mount, cardType, onClick) {
  // Remove possible previous icon
  $mount.find('.card-close-icon').remove();
  if (cardType === 'page') {
    $mount.prepend(template({}));
    var $close = $mount.find('.card-close-icon');
    $close.off('click');
    $close.click(onClick);
  }
};
