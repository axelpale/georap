// Usage:
//   var CardManager = require('./CardManager');
//   var cm = new CardManager();

module.exports = function CardManager() {

  // Constants
  var cardLayer = document.getElementById('card-layer');
  var cardBackground = document.getElementById('card-background');
  var cardContainer = document.getElementById('card-container');
  var self = this;

  // State
  // - none yet

  // Initialization
  cardBackground.addEventListener('click', function () {
    self.closeAll();
  });

  // Private methods
  var clearCardContainer = function () {
    // Note: innerHTML = '' is a slow method to do the same.
    // See http://stackoverflow.com/a/3450726/638546
    while (cardContainer.firstChild) {
      cardContainer.removeChild(cardContainer.firstChild);
    }
  };

  // Public methods

  this.openCard = function (htmlContent) {
    // Open a card over the map and close any other open cards.

    // Create card
    var card = document.createElement('div');
    card.innerHTML = htmlContent;

    // Remove possible other cards
    clearCardContainer();

    // Display if hidden
    cardContainer.appendChild(card);
    cardLayer.style.display = 'block';  // from 'none' if hidden
  };

  this.closeAll = function () {
    cardLayer.style.display = 'none';
    // Remove possible cards
    clearCardContainer();
  };
};
