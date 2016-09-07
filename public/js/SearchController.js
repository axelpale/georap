
// Templates
var searchTemplate = require('../templates/search.ejs');

module.exports = function (card) {
  // Parameters:
  //   card
  //     Instance of CardController. To fill a card.

  card.open(searchTemplate());
};
