exports.skipLimitParser = (req, res, next) => {
  // Validate skip and limit arguments in req.query
  //
  const skip = parseInt(req.query.skip, 10)
  const limit = parseInt(req.query.limit, 10)
  if (isNaN(skip) || skip < 0) {
    return res.status(status.BAD_REQUEST).send('Invalid skip')
  }
  if (isNaN(limit) || limit < 0) {
    return res.status(status.BAD_REQUEST).send('Invalid limit')
  }
  req.query.skip = skip
  req.query.limit = limit

  return next()
}
