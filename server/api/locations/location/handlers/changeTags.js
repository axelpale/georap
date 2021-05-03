const status = require('http-status-codes');

module.exports = (req, res) => {
  // Update location tags
  // TODO Remove at some point
  const msg = 'Tags API is not available anymore. Update your client.';
  return res.status(status.GONE).send(msg);
};
