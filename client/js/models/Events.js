var emitter = require('component-emitter');


module.exports = function (account) {
  // Parameters:
  //   account
  //     models.Account

  // Init
  emitter(this);

  this.getRecent = function (page, callback) {

    $.getJSON('/api/events', {
      page: page,
      token: account.getToken(),
    }, function (data) {
      return callback(null, data);
    });

  };
};
