
module.exports = {

  // Site secret. CHANGE! DO NOT EXPOSE TO CLIENT!
  // Used to encrypt and decrypt passwords and tokens.
  secret: '123456789',

  // Default admin user
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: '1234'
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
