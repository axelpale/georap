const dal = require('./dal');

exports.getAll = function (req, res, next) {

  dal.getAll((err, data) => {
    if (err) {
      return next(err);
    }

    return res.json(data);
  });
};
