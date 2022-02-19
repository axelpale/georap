const len = 6;
const dec = 10;

exports.generate = function () {
  // Return a random security code length six.
  //
  let digits = '';
  for (let i = 0; i < len; i += 1) {
    digits += Math.floor(10 * Math.random()).toString(dec);
  }
  return digits;
};

exports.validate = function (code) {
  return (typeof code === 'string' && code.length === len);
};
