
exports.getOrGenerate = function (req, res, next) {
  var iconName = req.params.iconName;

  return res.send(iconName);
}
