
var cardTemplate = require('../../templates/card.ejs');

module.exports = function (onUserClose) {

  // Constants
  var cardLayer = document.getElementById('card-layer');
  var self = this;

  // State
  // - stored in DOM

  // Private methods

  var fillCardLayer = function (content) {
    // Parameters:
    //   content
    //     string
    //       html content.
    cardLayer.innerHTML = content;
  };

  var clearCardLayer = function () {
    // Note: innerHTML = '' is a slow method to do the same.
    // See http://stackoverflow.com/a/3450726/638546
    while (cardLayer.firstChild) {
      cardLayer.removeChild(cardLayer.firstChild);
    }
  };

  // Public methods

  this.open = function (htmlContent, cardClass) {
    // Open a card over the map and close any other open cards.
    //
    // Parameters:
    //   htmlContent
    //     to be rendered inside the card
    //   cardClass
    //     string, optional. Card type. Available types:
    //       page (default)
    //         A fraction of the map is visible.
    //       full
    //         Fills the map area completely.
    var card, cardType;

    // Handle default parameters
    if (typeof cardClass === 'undefined') {
      cardType = 'page';
    } else {
      cardType = cardClass;
    }

    // Create card
    card = cardTemplate({
      content: htmlContent,
      cardClass: cardType,
    });

    // Remove possible other cards
    fillCardLayer(card);

    // Display if hidden
    cardLayer.style.display = 'block';  // from 'none' if hidden

    // Initialize close mechanism
    if (cardType === 'page') {
      $('#card-background').click(function () {
        self.close();

        return onUserClose();
      });
    }
  };

  this.close = function () {
    cardLayer.style.display = 'none';
    // Remove possible cards
    clearCardLayer();
  };

};
