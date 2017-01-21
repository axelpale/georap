var Attachment = require('../entries/Attachment');
var Created = require('../entries/Created');
var Rename = require('../entries/Rename');
var Tagadd = require('../entries/Tagadd');
var Tagdel = require('../entries/Tagdel');
var Visit = require('../entries/Visit');
var Story = require('../entries/Story');
var Move = require('../entries/Move');

module.exports = function (rawEntry, location) {
  // Convert rawEntry to entry model
  switch (rawEntry.type) {
    case 'attachment':
      return new Attachment(rawEntry, location);
    case 'created':
      return new Created(rawEntry, location);
    case 'rename':
      return new Rename(rawEntry, location);
    case 'tagadd':
      return new Tagadd(rawEntry, location);
    case 'tagdel':
      return new Tagdel(rawEntry, location);
    case 'story':
      return new Story(rawEntry, location);
    case 'visit':
      return new Visit(rawEntry, location);
    case 'move':
      return new Move(rawEntry, location);
    default:
      throw new Error('unknown entry type');
  }
};
