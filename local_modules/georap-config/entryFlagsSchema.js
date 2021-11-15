module.exports = {
  type: 'object',
  // To ensure the value of each property follows the same schema
  // a sort of HACK is required. The patternProperties keyword,
  // all-including regexp and additionalProperties:false together
  // work as 'items' keyword with arrays.
  patternProperties: {
    '^.*$': {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        plural: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        glyphicon: {
          type: 'string',
        },
        reward: {
          type: 'integer',
        },
        precondition: {
          type: 'object',
        },
      },
      required: [
        'name',
        'plural',
        'description',
        'glyphicon',
        'reward',
        'precondition',
      ],
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};
