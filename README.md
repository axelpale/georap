# tresdb

![Example](doc/tresdb_menu.jpg)

Everyone has their own secret places. TresDB was created to allow you to browse, manage, and describe those secret geographical locations in a private but easy manner. It is a geographical content management system and targeted to persons, groups, or organisations who fear revealing their precious locations to the public or to big companies like Google who offer similar map services. Whether your topic is urban exploration, traveling, berry picking, or treasure hunting, we bet you will find TresDB useful.

TresDB is also a web application and thus requires installation to a web server. The web server is required to have Node.js and MongoDB available.

**Table of Contents**

- [Install](#install)
- [Quick start](#quick-start)
- [Environments](#environments)
- [Scripts API](#scripts-api)
- [Testing](#testing)
- [Logging](#logging)
- [Migration](#migration)
- [Database backups](#database-backups)
- [MongoDB user setup](#mongodb-user-setup)
- [Production](#production)
- [Technology stack](#technology-stack)
- [Versioning](#versioning)
- [Issues](#issues)
- [License](#license)


## Install

We assume you have Node.js v4.5.0 or later already installed.

First, clone the repository:

    $ git clone https://github.com/axelpale/tresdb.git

Second, install MongoDB by following [the instructions](https://www.mongodb.org/downloads). For example, on OS X:

    $ brew install mongodb

Third, create `tresdb` database and user for the database. See [MongoDB user setup](#mongodb-user-setup) below for details.

Then, install dependencies:

    $ npm install

Finally, rename `config/local-sample.js` to `config/local.js` and modify it to match your setting.



## Quick start

First, after installation, start MongoDB (if it ever refuses to stop, try `killall mongod`):

    $ npm run mongod

Second, start the TresDB Node.js server:

    $ npm start

Finally, browse to [localhost:3000](http://localhost:3000). You can change the port by editing `config/local.js`.



## Environments

TresDB's Node server can be started in 3 environments: `development`, `production`, and `test`. The effects of each env is listed below:

- `development`: Client-side JS is bundled but not minified. Webpack server static assets from memory and recompiles the changes automatically without need to restart the server.
- `production`: Client-side JS is bundled and minified once on server start. Static files are served by Express.
- `test`: Same as development but a test MongoDB database is used instead of the main one. The test database is cleared and populated with fixture data before each test.

You specify the environment to use by setting `NODE_ENV`. For example to run server in dev env, use `NODE_ENV=development node server/index.js`. Most `npm run` scripts of TresDB already include this env specification. See `package.json` for details.



## Scripts API

### npm start

Alias for [npm run server:production](#npm-run-server-production)

### npm run server:development

Requirements: MongoDB is running

Starts the server in the development env. See [Environments](#environments) for details.

### npm run server:production

Requirements: MongoDB is running

Starts the server in the production env. See [Environments](#environments) for details.

### npm run server:test

Requirements: MongoDB is running

Starts the server in the test env. See [Environments](#environments) for details.

### npm run loadsample

Requirements: MongoDB is running

Warning: destroys the database content but leaves mongodb users.

Replaces the database content such as locations and accounts with default content. Indices are created/recreated. You can modify the default content by editing `cli/fixtures/sample.js`.

### npm run ensureindices

Requirements: MongoDB is running

Recreates indices listed in `cli/fixtures/sample.js` without altering content such as locations or accounts.

### npm run migrate

Requirements: MongoDB is running

Updates the database schema. Detects automatically the current schema version and the migration steps required to match the version in `package.json`. For details about the migration steps, see under `migration/versions/`.

### npm run backup

Requirements: MongoDB is running

Stores the content and indices as a directory under `.data/backups`. The directory will be named after the time of the backup. The content is stored in BSON format.

### npm run backup list

Requirements: MongoDB is running

Lists the backups available for restoration.

### npm run restore [backup_name]

Requirements: MongoDB is running

Restores a backup specified by `backup_name`. If `backup_name` is omitted then the most recent backup is used.

### npm run lint

Runs ESLint over the whole codebase. See `.eslintrc.js` and `client/.eslintrc.js` for configuration details.

### npm run mongo

Requirements: MongoDB is running

Starts mongo client on tresdb database.

### npm run mongo:test

Requirements: MongoDB is running

Starts mongo client on test database.

### npm run mongod

Starts MongoDB in auth mode and with the path `.data/db/`. The command creates the path if it does not exist.

### npm run reset

Warning: destroys all data in MongoDB, including MongoDB users.

Warning: destroys all backups, logs, and uploads

Clears the project.

### npm run test

Requirements: MongoDB is running

Runs the full test suite.

### npm run test:client

Requirements: Server is running, MongoDB is running

Runs client-side tests. Will probably be deprecated in the future.

### npm run test:server

Requirements: Server is running, MongoDB is running

Runs a server API test suite.

### npm run test:migration

Requirements: MongoDB is running

Runs a migration test suite.

### npm run worker

Requirements: MongoDB is running

Executes one work cycle. A cycle includes jobs such as computing marker layers, fetching missing reverse geocodes, and building search indices. In production, the worker is meant to be invoked as a cronjob once in a while. For details, see under `worker/`.



## Testing

First, we need to create a database `test` for tests and a database user. See [MongoDB user setup](#mongodb-user-setup) instructions below.

After initial setup, fire up mongod:

    $ npm run mongod

Then, open a new terminal session and fire up the server in the test environment:

    $ npm run server:test

Finally, open yet another terminal session and run the full test suite:

    $ npm test

See `package.json` for test suite details.

To clone a collection from a remote production database for local testing, following approach can be used. First we forward a local port to the remote database. Often the remote database cannot be accessed directly and therefore a SSH tunnel is needed.

    $ ssh -L 27018:localhost:27017 123.123.123.123

Second, we [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) a remote collection and save it as a local JSON file:

    $ mongoexport --host localhost:27018 --username remoteuser --password remoteword --db tresdb --collection locations --out .tmp/locations.json

Third, we [mongoimport](https://docs.mongodb.com/manual/reference/program/mongoimport/) the file to our local database:

    $ mongoimport --username localfoouser --password localbarword --db tresdb --collection locations --file .tmp/locations.json

Finally, a bit of cleanup remains. We close the tunnel and remove the temp file:

    $ rm .tmp/locations.json

As a result, our local locations collection is filled with locations from a production server.


## Logging

Server logs are stored under `.data/logs/` by default. To change the dir, edit `config/local.js`. See `server/services/logs/` for how logs are created.



## Migration

During development, the database schema can and will evolve. For each schema evolution step, the major package version is increased (e.g. from 1.2.3 to 2.0.0). To update old TresDB instances and their databases, we provice programmatic migration steps for each version increment and a script to execute them.

First, pull the desired TresDB version from git:

    $ git pull

Then, you can run the migration by:

    $ npm run migrate

You will see output about steps taken during migration.

Under the hood, the migration script does the following:

- figures out the current database schema version
- figures out the required database schema version
- deduces required migration steps, specified under `migration/versions/`
- updates the database by executing the steps.



## Database backups

To take a snapshot of the database:

    $ npm run backup

To restore the latest snapshot:

    $ npm run restore

The snapshots are named after their creation time.

To list available snapshots:

    $ npm run backup list

To restore a specific snapshot:

    $ npm run restore 2016-12-31T23-59-59

The backups are stored under `.data/backups` by default. To change this, modify `mongo.backupDir` in `config/local.js`. To remove a backup, remove its directory, e.g. `$ rm -rf .data/backups/2016-12-31T23-59-59`.

After restoring it is often necessary to run migrate, ensureindices, and worker:

    $ npm run migrate
    $ npm run ensureindices
    $ npm run worker


## MongoDB user setup

We recommend running MongoDB in auth mode to prevent free access to the database. For that, we create three database users: one to add new database users, one to access the main database from TresDB app, and one to access the test database. The last is required only to run the test suite.

To create users, start mongod without authentication:

    $ mkdir -p .data/db
    $ mongod --dbpath=.data/db

Create an administrator that can add other users. Create the admin user into `admin` database with `userAdminAnyDatabase` permission like below. Replace the username and password with yours.

    $ mongo
    > use admin
    > db.createUser({
      user: 'foodmin',
      pwd: 'barword',
      roles: ['userAdminAnyDatabase']
    })

Next, create a user with permission to access only `tresdb`. Note that this user needs to be created into `tresdb` database instead of `admin`. Thus, authenticate first on `admin`, and then switch to `tresdb` to create.

    > use admin
    > db.auth('foodmin', 'barword')
    > use tresdb
    > db.createUser({ user: 'foo', pwd: 'bar', roles: ['readWrite'] })

Then in similar manner, create the test user that can access only 'test':

    > use test
    > db.createUser({ user: 'foo', pwd: 'bar', roles: ['readWrite'] })

Modify `mongo.url` and `mongo.testUrl` properties in `config/local.js` to include the new credentials of the database users:

    ...
    mongo: {
      url: 'mongodb://foo:bar@localhost:27017/tresdb',
      testUrl: 'mongodb://foo:bar@localhost:27017/test'
    }
    ...

From now on, you can and you should run mongod with authentication:

    $ mongod --auth --dbpath=.data/db

or alternatively just `$ npm run mongod`.



## Production

Here are some notes and tips for putting a TresDB instance into production.


### Check dependencies for vulnerabilities

    $ npm install nsp -g
    $ nsp check

### Run in production environment

    $ npm run production

### Recommendation: use pm2 for process management

    $ pm2 restart ecosystem.json



## Technology stack

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/): maps and markers
- [Marked](https://github.com/chjj/marked): markdown parser
- [Bootstrap](http://getbootstrap.com/): styles
- [jQuery](https://jquery.com/): DOM manipulation
- [Lodash](https://lodash.com/): utility functions
- [Webpack](https://webpack.github.io/): client code bundling
- [Socket.io](http://socket.io/): client-server connection
- [bcrypt](https://www.npmjs.com/package/bcryptjs): password hashing
- [JSON Web Tokens](https://github.com/auth0/node-jsonwebtoken): session management
- [Morgan](https://github.com/expressjs/morgan): request logging
- [Express](https://expressjs.com/): server framework
- [Node.js](https://nodejs.org/en/): runtime environment
- [Monk](https://github.com/Automattic/monk): database connection layer
- [MongoDB](https://docs.mongodb.com/manual/): document database

Development tools:

- [ESLint](http://eslint.org/): linting
- [CasperJS](http://casperjs.org/): headless testing
- [Mocha](https://mochajs.org/): test runner
- [Should](http://shouldjs.github.io/): assertions

For production, we recommend:

- [DigitalOcean](https://m.do.co/c/3e63e3de8e31): cloud servers
- [Nginx](https://www.nginx.com/): reverse proxy
- [Let's Encrypt](https://letsencrypt.org/): TLS certificates


## Versioning

On the master branch, we use the [semantic versioning](http://semver.org/) scheme. The semantic version increments are bound to the operations you need to do when upgrading your TresDB instance:

- MAJOR (+1.0.0) denotes a new incompatible feature. A database migration might be required after upgrade. Hyperlinks of earlier versions might not work.
- MINOR (+0.1.0) denotes a new backwards-compatible feature. Upgrading directly from the Git should not break anything.
- PATCH (+0.0.1) denotes a backwards-compatible bug fix. Upgrading or downgrading directly from the Git should not break anything.


## Issues

Report bugs and features to [GitHub issues](https://github.com/axelpale/tresdb/issues).

The issue labels follow [Drupal's issue priority levels](https://www.drupal.org/core/issue-priority): critical, major, normal, and minor.


## License

MIT
