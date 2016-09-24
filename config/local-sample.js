var path = require('path');

module.exports = {

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // Used to encrypt and decrypt passwords and tokens.
  secret: '123456789',

  // Static file directory.
  // Express will serve static files in this directory.
  staticDir: path.resolve(__dirname, '../.tmp/public'),

  // Port for server to listen
  port: 3000,

  // Default admin user
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '1234'
  },

  // Mongo database settings
  mongo: {
    url: 'mongodb://foouser:barword@localhost:27017/tresdb'
  },

  // Email server connection
  // For details, see https://nodemailer.com/2-0-0-beta/setup-smtp/.
  smtp: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    auth: {
      user: 'exampleuser',
      pass: 'examplepass'
    }
  },
  // Email messages
  mail: {
    sender: 'admin@example.com'
  }
}
