var Attachment = require('../entries/Attachment');
var Story = require('../entries/Story');
var Visit = require('../entries/Visit');

module.exports = function (rawEntry, location) {
  // Convert rawEntry to entry model
  switch (rawEntry.type) {
    case 'location_attachment':
      return new Attachment(rawEntry, location);
    case 'location_story':
      return new Story(rawEntry, location);
    case 'location_visit':
      return new Visit(rawEntry, location);
    default:
      throw new Error('Unknown entry model type:' + rawEntry.type);
  }
};
