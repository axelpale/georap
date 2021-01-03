var ui = require('tresdb-ui');

module.exports = function (msg) {
  return ui.markdownToHtml(msg);
};
