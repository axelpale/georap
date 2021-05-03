// Markdown parsing.
const TurndownService = require('turndown');
const turndownService = new TurndownService();
const striptags = require('striptags');

module.exports = function (desc) {
  // Convert to markdown. Remove all remaining html tags.
  // Sometimes descriptions include only adjacent anchor tags.
  // We like to add a space between them for clarity.
  if (typeof desc !== 'string') {
    return '';
  }
  const spaced = desc.replace('/a><a', '/a>, <a');
  const mark = turndownService.turndown(spaced.trim());

  return striptags(mark);
};
