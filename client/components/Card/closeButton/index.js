var template = require('./template.ejs');

module.exports = function ($mount, cardType, onClick) {
  // Remove possible previous icon
  $mount.find('.card-close-icon').remove();
  // If there is space at the left, create a new close button.
  if (cardType !== 'full') {
    $mount.prepend(template({}));
    var $close = $mount.find('.card-close-icon');
    $close.off('click');
    $close.click(onClick);
  }
};
