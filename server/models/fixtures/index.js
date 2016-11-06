/* eslint-disable no-magic-numbers */

module.exports = {
  collections: {
    locations: [{
      name: 'Irbene',
      geom: {
        type: 'Point',
        coordinates: [21.857705, 57.55341],
      },
      deleted: false,
      tags: ['walk-in'],
      content: [{
        type: 'created',
        user: 'admin',
        time: '2009-07-30T10:44:58.000Z',
        data: {},
      }, {
        type: 'story',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'A ghost town',
        },
      }],
      neighborsAvgDist: 42886.25362949583,
      layer: 12,
    }],
  },
  indices: [
    {
      collection: 'locations',
      spec: { geom: '2dsphere' },
      options: {},
    },
  ],
};
