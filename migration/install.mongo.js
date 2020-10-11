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
tresdb.createUser({
  user: 'testuser',
  pwd: 'testuserpwd',
  roles: ['readWrite']
});
