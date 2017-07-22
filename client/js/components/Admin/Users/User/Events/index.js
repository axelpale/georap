var template = require('./template.ejs');

module.exports = function (user) {

  this.bind = function ($mount) {

    $mount.html(template({
      events: [
        {
          user: 'foodmin',
          time: '2009-10-04T23:44:21.000Z',
          type: 'user_expiration_changed',
        }
      ],
    }));

  };

  this.unbind = function () {
  };
};
