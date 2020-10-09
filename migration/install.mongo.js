conf = require('../config/local'); // does not work, at least with old shell
conn = new Mongo();
admin = conn.getDB('admin');
admin.createUser({
  user: 'foodmin',
  pwd: 'barword',
  roles: ['userAdminAnyDatabase']
});
tresdb = admin.getSiblingDB('tresdb');
tresdb.createUser({
  user: 'fooser',
  pwd: 'barword',
  roles: ['readWrite']
});
testdb = admin.getSiblingDB('test');
tresdb.createUser({
  user: 'tester',
  pwd: 'barword',
  roles: ['readWrite']
});
