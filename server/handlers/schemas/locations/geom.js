module.exports = {
  'type': 'object',
  'required': ['type', 'coordinates'],
  'properties': {
    'type': { 'enum': ['Point'] },
    'coordinates': {
      'description': 'A single position',
      'type': 'array',
      'minItems': 2,
      'items': [ { 'type': 'number' }, { 'type': 'number' } ],
      'additionalItems': false,
    },
  },
};
