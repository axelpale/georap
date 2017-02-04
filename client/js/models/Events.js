var emitter = require('component-emitter');


module.exports = function (account) {
  // Parameters:
  //   account
  //     models.Account

  // Init
  emitter(this);

  this.getRecent = function (page, callback) {

    $.ajax({
      url: '/api/events',
      method: 'GET',
      data: {
        page: page,
      },
      dataType: 'json',
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function (data) {
        return callback(null, data);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
    });

  };

};
