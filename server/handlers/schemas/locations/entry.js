var geom = require('./geom');

var idSchema = {
  type: 'string',
};

var timeSchema = {
  type: 'string',
  format: 'date-time',
};

var userSchema = {
  type: 'string',
};

module.exports = {
  type: 'object',
  required: ['_id', 'time', 'type', 'user', 'data'],
  oneOf: [

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['attachment'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'filepath',
            'mimetype',
          ],
          additionalProperties: false,
          properties: {
            filepath: { type: 'string' },
            mimetype: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['created'],
        },
        user: userSchema,
        data: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['rename'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'oldName',
            'newName',
          ],
          additionalProperties: false,
          properties: {
            oldName: { type: 'string' },
            newName: { type: 'string' },
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['story'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'markdown',
          ],
          additionalProperties: false,
          properties: {
            markdown: { type: 'string' },
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['visit'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'year',
          ],
          additionalProperties: false,
          properties: {
            year: { type: 'integer' },
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['move'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'oldGeom',
            'newGeom',
          ],
          additionalProperties: false,
          properties: {
            oldGeom: geom,
            newGeom: geom,
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['tagadd'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'tag',
          ],
          additionalProperties: false,
          properties: {
            tag: { type: 'string' },
          },
        },
      },
    },

    {
      additionalProperties: false,
      properties: {
        _id: idSchema,
        time: timeSchema,
        type: {
          type: 'string',
          enum: ['tagdel'],
        },
        user: userSchema,
        data: {
          type: 'object',
          required: [
            'tag',
          ],
          additionalProperties: false,
          properties: {
            tag: { type: 'string' },
          },
        },
      },
    },

  ],
};
