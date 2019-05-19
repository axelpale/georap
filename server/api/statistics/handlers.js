var dal = require('./dal');

exports.getAll = function (req, res, next) {

  dal.getAll(function (err, data) {
    if (err) {
      return next(err);
    }

    return res.json(data);
  });
};
