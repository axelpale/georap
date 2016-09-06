var sails = require('sails');

module.exports = {
  getHello: function (req, res) {
    sails.log.debug('GET hello');
    res.ok({
      msg: 'Gethelllo'
    });
  },
  postHello: function (req, res) {
    sails.log.debug('POST hello');
    res.ok({
      msg: 'Um, hello...'
    });
  }
};
