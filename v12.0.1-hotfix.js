// Repairs missing createdAt timestamps
//
// Run:
//   $ NODE_ENV=production node v12.0.1-hotfix.js
//

const db = require('georap-db');
const addCreatedAt = require('./migration/versions/v11v12/addCreatedAt');

db.init(() => {
  addCreatedAt((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Bug successfully repaired');
    }

    db.close();
  });
});
