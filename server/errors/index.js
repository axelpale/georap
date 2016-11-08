
exports.responses = require('./responses');

exports.NotFoundError = new Error('Document was not found.');
exports.NotFoundError.name = 'NotFoundError';
