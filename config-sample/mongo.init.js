// WARNING This script creates MongoDB users and their permissions
// as required by TresDB development. Do not use this script in production
// without careful modification of all the credentials below.
// NOTE This script needs a MongoDB instance without --auth flag
// to be running and listening the default port.
conn = new Mongo();
admin = conn.getDB('admin');
admin.createUser({
  user: 'mongoadmin',
  pwd: 'mongoadminpwd',
  roles: ['userAdminAnyDatabase']
});
tresdb = admin.getSiblingDB('tresdb');
tresdb.createUser({
  user: 'mongouser',
  pwd: 'mongouserpwd',
  roles: ['readWrite']
});
testdb = admin.getSiblingDB('test');
testdb.createUser({
  user: 'testuser',
  pwd: 'testuserpwd',
  roles: ['readWrite']
});
