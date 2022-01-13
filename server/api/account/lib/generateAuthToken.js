const config = require('georap-config');
const jwt = require('jsonwebtoken');

module.exports = (username, email, role) => {
  // Create a JWT token that will be stored client-side.
  //

  const tokenPayload = {
    name: username,
    email: email,
    role: role,
  };

  // The following will add 'exp' property to payload.
  // For time formatting, see https://github.com/zeit/ms
  const tokenOptions = {
    expiresIn: '60d', // two months,
  };

  const token = jwt.sign(tokenPayload, config.secret, tokenOptions);

  return token;
};
