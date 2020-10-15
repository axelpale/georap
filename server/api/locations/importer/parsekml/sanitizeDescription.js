// Markdown parsing.
var TurndownService = require('turndown');
var turndownService = new TurndownService();
var striptags = require('striptags');

module.exports = function (desc) {
  // Convert to markdown. Remove all remaining html tags.
  // Sometimes descriptions include only adjacent anchor tags.
  // We like to add a space between them for clarity.
  if (typeof desc !== 'string') {
    return '';
  }
  var spaced = desc.replace('/a><a', '/a>, <a');
  var mark = turndownService.turndown(spaced.trim());

  return striptags(mark);
};
