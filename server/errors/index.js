
exports.responses = require('./responses');

exports.NotFoundError = new Error('Document was not found.');
exports.NotFoundError.name = 'NotFoundError';

exports.deprecationError = new Error('This feature has been deprecated');
exports.deprecationError.name = 'DeprecationError';
