var emitter = require('component-emitter');

module.exports = function (account) {
  // Usage:
  //   var users = new models.Users(account)
  //
  // Parameters:
  //   account
  //     a models.Account
  //

  // Init
  emitter(self);

  // Public methods

  this.getAll = function (callback) {
    // Fetch a users from server and return array of raw user objects.
    // Will call back with error if not found.
    //
    // Parameters:
    //   callback
    //     function (err, user)
    //

    $.ajax({
      url: '/api/users',
      method: 'GET',
      dataType: 'json',
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function (rawUsers) {

        return callback(null, rawUsers);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
    });
  };

  this.getOne = function (username, callback) {
    // Fetch a user from server and return raw user object.
    // Will call back with error if not found.
    //
    // Parameters:
    //   username
    //     string
    //   callback
    //     function (err, user)
    //

    $.ajax({
      url: '/api/users/' + username,
      method: 'GET',
      dataType: 'json',
      headers: { 'Authorization': 'Bearer ' + account.getToken() },
      success: function (rawUser) {

        return callback(null, rawUser);
      },
      error: function (jqxhr, textStatus, errorThrown) {
        return callback(errorThrown);
      },
    });
  };
};
