// Repairs missing createdAt timestamps
//
// You should run this if you upgraded directly to v12.0.0 and
// any locations were created until upgrade to v12.0.1 or later.
// If you upgraded from v11.x directly to v12.0.1 or later, you can safely
// ignore this hotfix.
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
