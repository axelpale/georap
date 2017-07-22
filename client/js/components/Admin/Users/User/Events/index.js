//var template = require('./template.ejs');

// eslint-disable-next-line no-unused-vars
module.exports = function (user) {

  // eslint-disable-next-line no-unused-vars
  this.bind = function ($mount) {

    /*$mount.html(template({
      events: [
        {
          user: user.getName(),
          time: '2009-10-04T23:44:21.000Z',
          type: 'user_expiration_changed',
        },
      ],
    }));*/

  };

  this.unbind = function () {
  };
};
