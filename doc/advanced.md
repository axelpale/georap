# Advanced topics on managing Georap server

**Table of Contents**

- [Git branching strategy](#git-branching-strategy)
- [Logging](#logging)
- [Testing](#testing)
- [MongoDB user setup](#mongodb-user-setup)
- [Populate from a remote database](#populate-from-a-remote-database)


## Git branching strategy

We have a single `master` branch. New features are developed in `feature-somefeatname` like branches and then merged to the master via a pull request.

Small updates to documentation are allowed to be done directly to `master`.



## Logging

Server logs are stored under `.data/logs/` by default. To change the dir, edit `config/index.js`. See `server/services/logs/` for how logs are created.



## Testing

First, we need to create a database `test` for tests and a database user. See [MongoDB user setup](#mongodb-user-setup) for instructions.

After creation, fire up mongod:

    $ npm run mongod

Then, open a new terminal session and fire up the server in the test environment:

    $ npm run server:test

Finally, open yet another terminal session and run the full test suite:

    $ npm test

See `package.json` for test suite details.

### Testing error handling

There are two hidden URLs that are designed to cause an internal server error. The URLs are available for admin user only and thus require token authorisation. For now, you can find your token from the download URLs of Export feature.

    /api/admin/tests/throw-error?token=<jwt>
    /api/admin/tests/next-error?token=<jwt>



## MongoDB user setup

We recommend running MongoDB in auth mode to prevent free access to the database. For that, we create three database users: one to add new database users, one to access the main database from Georap app, and one to access the test database. The last is required only to run the test suite.

To create users, start mongod without authentication:

    $ mkdir -p .data/db
    $ mongod --dbpath=.data/db

Create an administrator that can add other users. Create the admin user into `admin` database with `userAdminAnyDatabase` and `backup` permissions like below. Replace the username and password with yours.

    $ mongosh
    > use admin
    > db.createUser({
      user: 'mongoadmin',
      pwd: 'mongoadminpwd',
      roles: ['userAdminAnyDatabase', 'backup']
    })

Next, create a user with permission to access only `georap`. Note that this user needs to be created into `georap` database instead of `admin`. Thus, authenticate first on `admin`, and then switch to `georap` to create.

    > use admin
    > db.auth('mongoadmin', 'mongoadminpwd')
    > use georap
    > db.createUser({ user: 'mongouser', pwd: 'mongouserpwd', roles: ['readWrite'] })

Then in similar manner, create the test user that can access only 'test':

    > use test
    > db.createUser({ user: 'mongouser', pwd: 'mongouserpwd', roles: ['readWrite'] })

Press `ctrl + d` to quit `mongo` client.

Modify `mongo.url` and `mongo.testUrl` properties in `config/index.js` to include the new credentials of the database users:

    ...
    mongo: {
      url: 'mongodb://mongouser:mongouserpwd@localhost:27017/georap',
      testUrl: 'mongodb://mongouser:mongouserpwd@localhost:27017/test'
    }
    ...

From now on, you can and you should run mongod with authentication:

    $ mongod --auth --dbpath=.data/db

or alternatively just `$ npm run mongod`.



## Populate from a remote database

Warning: details of this topic might be outdated.

It is sometimes useful to clone a collection from a remote production database for local testing. Here are some tips how to do that with [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) and [mongoimport](https://docs.mongodb.com/manual/reference/program/mongoimport/).

First, ensure your production database and the local development database share identical versions. We have experienced weird errors about missing libssl files when attempting to clone between different versions.

    $ mongod --version

Second, we need to connect to the production database. Often the remote database cannot be accessed directly. Either login to the production server shell or alternatively forward a local port to the remote database so that it acts like a local one. For the latter a SSH tunnel is needed.

    $ ssh -L 27018:localhost:27017 123.123.123.123

Third, we [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) a remote collection and save it as a local JSON file:

    $ mongoexport --host localhost:27018 --username remoteuser --password remoteword --db georap --collection locations --out tmp/locations.json

Repeat this for each collection you need.

Fourth, log out of production server or close the tunnel. If you exported the files on the production server, copy them to your local machine.

    $ scp 123.123.123.123:~/.tmp/locations.json .tmp/

Fifth, ensure your development database is running. Then [mongoimport](https://docs.mongodb.com/manual/reference/program/mongoimport/) the files to the database:

    $ mongoimport --username localfoouser --password localbarword --db georap --collection locations --file .tmp/locations.json

Use `--drop` flag if you need to clear each collection before importing.

Sixth, build indices for the imported data.

    $ npm run migrate

Finally, a bit of cleanup remains. Remove the temp files:

    $ rm .tmp/locations.json

As a result, our local locations collection is filled with locations from a production server.
