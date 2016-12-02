var StoryView = require('../Story');
var VisitView = require('../Visit');

module.exports = function (entryModel) {

  var type = entryModel.getType();

  switch (type) {
    case 'story':
      return new StoryView(entryModel);
    case 'visit':
      return new VisitView(entryModel);
    default:
      throw new Error('unknown content entry type: ' + type);
  }
};
