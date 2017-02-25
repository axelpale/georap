var AttachmentView = require('../Attachment');
var StoryView = require('../Story');
var VisitView = require('../Visit');

module.exports = function (entryModel) {

  var type = entryModel.getType();

  switch (type) {
    case 'location_attachment':
      return new AttachmentView(entryModel);
    case 'location_story':
      return new StoryView(entryModel);
    case 'location_visit':
      return new VisitView(entryModel);
    default:
      throw new Error('unknown content entry type: ' + type);
  }
};
