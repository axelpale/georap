
module.exports = function () {

  var didSendMail = false;
  var isBroken = false;

  this.sendMail = function (options, callback) {
    if (isBroken) {
      return callback(new Error('mail broken'));
    }
    didSendMail = true;
    return callback(null, { response: 'something' });
  };

  this.didSendMail = function () {
    return didSendMail;
  };

  this.fix = function () {
    isBroken = false;
  };

  this.break = function () {
    isBroken = true;
  };
};
