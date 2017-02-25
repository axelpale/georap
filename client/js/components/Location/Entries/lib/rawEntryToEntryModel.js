var Attachment = require('../Attachment/Model');
var Story = require('../Story/Model');
var Visit = require('../Visit/Model');

module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     plain object
  //   entries
  //     EntriesModel

  if (typeof entries !== 'object') {
    throw new Error('Missing or invalid entries model.');
  }

  // Convert rawEntry to entry model
  switch (rawEntry.type) {
    case 'location_attachment':
      return new Attachment(rawEntry, entries);
    case 'location_story':
      return new Story(rawEntry, entries);
    case 'location_visit':
      return new Visit(rawEntry, entries);
    default:
      throw new Error('Unknown entry model type:' + rawEntry.type);
  }
};
