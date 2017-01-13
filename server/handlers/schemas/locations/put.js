
var locationSchema = require('./location');

module.exports = {
  type: 'object',
  required: ['location'],
  properties: {
    location: locationSchema,
  },
};
