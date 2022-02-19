var request = require('../lib/request');

module.exports = function (params, callback) {
  // Parameters
  //   params
  //     email
  //       string, valid email
  //     lang
  //       string, a locale string e.g. 'en'. If server does not support
  //       the selected locale, the invitation is sent in the default lang.
  //     role
  //       string, a user role.
  //   callback
  //     function
  //
  request.postJSON({
    url: '/api/account/invite',
    data: {
      email: params.email,
      lang: params.lang,
      role: params.role,
    },
  }, callback);
};
