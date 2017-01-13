var AttachmentView = require('../entries/Attachment');
var CreatedView = require('../entries/Created');
var RenameView = require('../entries/Rename');
var StoryView = require('../entries/Story');
var VisitView = require('../entries/Visit');

module.exports = function (entryModel, account) {

  var type = entryModel.getType();

  switch (type) {
    case 'attachment':
      return new AttachmentView(entryModel);
    case 'created':
      return new CreatedView(entryModel);
    case 'rename':
      return new RenameView(entryModel);
    case 'story':
      return new StoryView(entryModel, account);
    case 'visit':
      return new VisitView(entryModel);
    default:
      throw new Error('unknown content entry type: ' + type);
  }
};
