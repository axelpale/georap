// Singleton wrapper around nodemailer

var nodemailer = require('nodemailer');
var local = require('../../config/local');

var mailer = null;

exports.init = function () {
  // Email transporter setup and verification.

  if (mailer === null) {

    mailer = nodemailer.createTransport(local.smtp);

    mailer.verify(function (err) {
      if (err) {
        console.log('Connection to mail server failed:');
        console.log(err);
      } else {
        console.log('Connected to mail server...');
      }
    });
  }
};

exports.get = function () {
  if (mailer !== null) {
    return mailer;
  }

  throw new Error('mailer.init must be called before mailer.get');
};

exports.mock = function (customMailer) {
  // Replace the mailer with a custom mailer mock.
  // Useful in unit testing.
  mailer = customMailer;
};
