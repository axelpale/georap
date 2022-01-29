// WARNING changing the values might invalidate all passwords.
// Leave these as they are unless you know what you are doing.

// Bcrypt hashing strength
exports.bcrypt = {
  rounds: 10,
};

// Set node environment.
// Defaults to 'development' like app.get('env') in Express.
// Access process.env only in one place, here.
// See https://github.com/eslint/eslint/issues/657
exports.env = (function () {
  // eslint-disable-next-line no-process-env
  const env = process.env.NODE_ENV;

  if (env === 'production' || env === 'development' || env === 'test') {
    return env;
  }  // else

  return 'development';
}());
