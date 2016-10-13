var path = require('path');

module.exports = {

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // Used to encrypt and decrypt passwords and tokens.
  secret: '123456789',

  // Static files
  // Express/Webpack will copy the static files to be served to this directory:
  staticDir: path.resolve(__dirname, '../.tmp/public'),
  // URLs of the the static files are prefixed with this static URL root path:
  staticUrl: '/assets',

  // HTTPS
  // TresDB itself uses only HTTP. However if TresDB is running behind
  // a TLS-endpoint reverse-proxy like Nginx, the protocol appears to be
  // HTTPS for the users. Hyperlinks in emails such as invites and password
  // resets should then use HTTPS instead HTTP.
  // By setting publicProtocol property to 'https' instead 'http', HTTPS
  // is used in the links instead HTTP.
  publicProtocol: 'https',

  // Port for server to listen
  port: 3000,

  // Default admin user
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '1234',
  },

  // Mongo database settings
  mongo: {
    url: 'mongodb://foouser:barword@localhost:27017/tresdb',
  },

  // Email server connection
  // For details, see https://nodemailer.com/2-0-0-beta/setup-smtp/.
  smtp: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'exampleuser',
      pass: 'examplepass',
    },
  },
  // Email messages
  mail: {
    sender: 'admin@example.com',
  },

  // Bcrypt hashing
  bcrypt: {
    rounds: 10,
  },
};
