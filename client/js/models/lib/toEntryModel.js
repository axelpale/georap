var Attachment = require('../entries/Attachment');
var Created = require('../entries/Created');
var Rename = require('../entries/Rename');
var Visit = require('../entries/Visit');
var Story = require('../entries/Story');

module.exports = function (rawEntry, location) {
  // Convert rawEntry to entry model
  switch (rawEntry.type) {
    case 'attachment':
      return new Attachment(rawEntry, location);
    case 'created':
      return new Created(rawEntry, location);
    case 'rename':
      return new Rename(rawEntry, location);
    case 'story':
      return new Story(rawEntry, location);
    case 'visit':
      return new Visit(rawEntry, location);
    default:
      throw new Error('unknown entry type');
  }
};
