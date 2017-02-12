var AttachmentView = require('../entries/Attachment');
var CreatedView = require('../entries/Created');
var RenameView = require('../entries/Rename');
var TagaddView = require('../entries/Tagadd');
var TagdelView = require('../entries/Tagdel');
var StoryView = require('../entries/Story');
var VisitView = require('../entries/Visit');
var MoveView = require('../entries/Move');

module.exports = function (entryModel) {

  var type = entryModel.getType();

  switch (type) {
    case 'attachment':
      return new AttachmentView(entryModel);
    case 'created':
      return new CreatedView(entryModel);
    case 'rename':
      return new RenameView(entryModel);
    case 'tagadd':
      return new TagaddView(entryModel);
    case 'tagdel':
      return new TagdelView(entryModel);
    case 'story':
      return new StoryView(entryModel);
    case 'visit':
      return new VisitView(entryModel);
    case 'move':
      return new MoveView(entryModel);
    default:
      throw new Error('unknown content entry type: ' + type);
  }
};
