// Username parser middleware

module.exports = function (req, res, next) {
  // Catches the username
  req.username = req.params.username;
  return next();
};
