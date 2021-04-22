
exports.nextError = function (req, res, next) {
  const err = new Error('This error was passed to next().');
  return next(err);
};

exports.throwError = function () {
  throw new Error('This error was thrown synchronously.');
};
