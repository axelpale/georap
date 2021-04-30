/* eslint-disable no-magic-numbers */

const db = require('georap-db');

module.exports = {
  collections: {
    locations: [
      {
        _id: db.id('581f166110a1482dd0b7cd13'),
        creator: 'admin',
        deleted: false,
        published: false,
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        layer: 12,
        isLayered: true,
        name: 'Irbene',
        points: 0,
        places: [],
        status: 'abandoned',
        type: 'town',
        text1: 'irb irbene admin walk-in',
        text2: '',
      },
      {
        _id: db.id('581f166110a1482dd0b7cd14'),
        creator: 'johndoe',
        deleted: false,
        published: false,
        geom: {
          type: 'Point',
          coordinates: [18.23655, 59.30067],
        },
        layer: 12,
        isLayered: true,
        name: 'Mill',
        points: 0,
        places: [],
        status: 'abandoned',
        type: 'factory',
        text1: 'mill factory johndoe walk-in',
        text2: '',
      },
      {
        _id: db.id('581f166110a1482dd0b7cd15'),
        creator: 'johndoe',
        deleted: true,
        published: false,
        geom: {
          type: 'Point',
          coordinates: [23.721067, 61.502633],
        },
        layer: 12,
        isLayered: true,
        name: 'Kolkos',
        points: 0,
        places: [],
        status: 'unknown',
        type: 'factory',
        text1: 'kolkos factory johndoe',
        text2: '',
      },
    ],
  },
  indices: db.INDICES.filter((index) => {
    return index.collection === 'locations';
  }),
};
