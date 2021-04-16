# tresdb

![Example](doc/tresdb_menu.jpg)

Everyone has their own secret places. TresDB, a geographical content managing system, was created to allow you to browse, manage, and describe geolocations in a fun, easy and social manner. It is for persons, groups, or organisations who want to share, document, and discuss locations. It for them who want to keep all data in their own hands. Whether your topic is nature, constructions, urban exploration, traveling, berry picking, or treasure hunting, we bet you will find TresDB useful.

## Features

![](doc/10-full-map-view.jpg)<br>
1/9. TresDB can handle practically unlimited number of locations. Hierarchical grouping of map markers keeps things smooth and fast.

![](doc/20-location-and-images.jpg)<br>
2/9. Users create and import new locations for the community to discuss and remember. Each location receives own page.

![](doc/30-posting.jpg)<br>
3/9. Posts can include text, links, and optional image or other document.

![](doc/40-commenting.jpg)<br>
4/9. Users can comment posts for targeted discussion and reactions.

![](doc/50-tags-and-icons.jpg)<br>
5/9. Marker icons can be configured to suit the needs of the community.

![](doc/60-coordinate-edit.jpg)<br>
6/9. All information of the location can be edited in an intuitive and responsive way.

![](doc/70-maps-and-coordinates.jpg)<br>
7/9. Location coordinates can be exported into external map services. The list of available services is configurable and extendable as well as the list of alternative coordinate systems.

![](doc/80-download.jpg)<br>
8/9. Each location can be downloaded as a file and exported to other map software and devices.

![](doc/90-menu.jpg)<br>
9/9. And lots of else, like full text search, full export, member administration tools and gamification features.

Read on for technical details and installation instructions.

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

TresDB is a web application and thus requires installation to a web server. The web server is required to have Node.js and MongoDB available.

We assume you have Node.js v10 or later and MongoDB v4 or later already installed. See [mongodb.org/downloads](https://www.mongodb.org/downloads) for instructions. For example on macOS:

    $ brew install mongodb

To install TresDB, first clone the repository:

    $ git clone https://github.com/axelpale/tresdb.git

Second, install dependencies:

    $ cd tresdb
    $ npm install

Fourth, create a MongoDB database named `tresdb` and create necessary database users. For a demo setup or development purposes, just install the default users:

    $ npm run mongod:init

Do not use the defaults in production. For production, see detailed [MongoDB user setup](#mongodb-user-setup).

Fifth, copy `config-sample/` as `config/`. The directory contains the main configuration for your TresDB app, including the title of the app, Google Maps API key, marker icons, and multiple other settings. Modify it to match your needs. The config will be validated whenever the server app is started.

    $ cp -R config-sample config
    $ nano config/index.js

After successful configuration, the final installation step is to populate the database with initial data. This will also install the user account you just configured.

    $ npm run migrate

Now your TresDB instance is successfully installed and ready to be started.

## Start up

First, after installation, start MongoDB in auth mode by running:

    $ npm run mongod

If it ever refuses to stop, try `killall mongod`. Happens sometimes.

Second, build the TresDB client app code. A bundle will be placed in the static file directory specified in the configuration.

    $ npm run build

Third, run a worker to compute search keywords and other cached data. Single run is enough for demo and development. In production, you would like to run the worker hourly or so.

    $ npm run worker

Finally, start the TresDB Node.js server on port `3000`. If you need another port, see the configuration file.

    $ npm start

Congratulations, all set up! Browse to [localhost:3000](http://localhost:3000) and enjoy.



## Environments

TresDB's Node server can be started in 3 environments: `development`, `production`, and `test`. Specify the environment to use by setting the `NODE_ENV` environment variable. The effects of each env is listed below:

- `production`: Default.
- `development`: Client app bundles are not minified.
- `test`: A `test` database is used instead of the main one. The test database is cleared and populated with fixture data before each test.

To run the server in the `development` env:

    $ npm run server:development

For other commands, see the scripts below.



## Scripts API

These helpful scripts are defined in `package.json`. See it for details.

### npm start

Alias for [npm run server:production](#npm-run-server-production)

### npm run watchstart

For development. Lint and re-run the server each time server code is modified.

### npm run build

Builds the client with webpack.

Webpack chunks the bundle. Usually a chunk contains a View. The chunk names are defined in client/routes.

### npm run watchbuild

For development. Lint and rebuild the client code bundle each time client code is modified.

### npm run server:development

Requirements: MongoDB is running

Starts the server in the development env. See [Environments](#environments) for details.

### npm run server:production

Requirements: MongoDB is running

Starts the server in the production env. See [Environments](#environments) for details.

### npm run server:test

Requirements: MongoDB is running

Starts the server in the test env. See [Environments](#environments) for details.

### npm run migrate

Requirements: MongoDB is running

Creates or updates the database schema. It detects the current schema version and the migration steps required to match the version in `package.json`. For details about the migration steps, see under `migration/versions/`.

### npm run lint

Runs ESLint over the whole codebase. See `.eslintrc.js` and `client/.eslintrc.js` for configuration details.

### npm run mongo

Requirements: MongoDB is running

Starts mongo client on tresdb database.

### npm run mongo:test

Requirements: MongoDB is running

Starts mongo client on test database.

### npm run mongod

Warning: use only for a demo or development.

Requirements: `mongod:init` and `mongod:init:users` have been run.

Starts MongoDB in auth mode and with the path `.data/db/`.

### npm run mongod:init

Warning: use only for a demo or development.

Starts MongoDB first time and without authentication.

### npm run mongod:init:users

Warning: use only for a demo or development. The default passwords are not secure for production.

Requirements: MongoDB without authentication is running.

Creates default MongoDB users for development.

### npm run reset

Warning: use only for a demo or development.

Warning: destroys all data in MongoDB, including MongoDB users.

Warning: destroys all backups, logs, and uploads.

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



## Logging

Server logs are stored under `.data/logs/` by default. To change the dir, edit `config/index.js`. See `server/services/logs/` for how logs are created.



## Update and migration

Warning: always back up before attempting to migrate. See [Database backups](#database-backups).

During development, the database schema can and will evolve. For each schema evolution step, the major package version is increased (e.g. from 1.2.3 to 2.0.0). To update old TresDB instances and their databases, we provide programmatic migration steps for each version increment and a script to execute them.

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

To update the client and server, rebuild and restart:

    $ npm run build
    $ npm run start



## Database backups

To take a snapshot of the database with [mongodump](https://docs.mongodb.com/v3.6/reference/program/mongodump/):

    $ mongodump --username <user> --password <userpwd> --db tresdb

If you want to take the snapshot as the admin user, add `--authenticationDatabase admin` to the command.

To restore the snapshot with [mongorestore](https://docs.mongodb.com/v3.6/reference/program/mongorestore/). Use `--drop` to drop existing collections before restore:

    $ mongorestore --username <user> --password <userpwd> --drop --db tresdb dump/tresdb

After restoring it might be necessary to run migrate and worker:

    $ npm run migrate
    $ npm run worker

In rare cases, restore can leave indices in odd state. If this happens, execute `db.<collection>.reIndex()` for each collection. However, `reIndex` requires the user to have role `dbAdmin` on the database. For development purposes `db.grantRolesToUser('mongoadmin',[{ db: 'tresdb', role: 'dbAdmin' }])` will do the trick.

## MongoDB user setup

We recommend running MongoDB in auth mode to prevent free access to the database. For that, we create three database users: one to add new database users, one to access the main database from TresDB app, and one to access the test database. The last is required only to run the test suite.

To create users, start mongod without authentication:

    $ mkdir -p .data/db
    $ mongod --dbpath=.data/db

Create an administrator that can add other users. Create the admin user into `admin` database with `userAdminAnyDatabase` and `backup` permissions like below. Replace the username and password with yours.

    $ mongo
    > use admin
    > db.createUser({
      user: 'mongoadmin',
      pwd: 'mongoadminpwd',
      roles: ['userAdminAnyDatabase', 'backup']
    })

Next, create a user with permission to access only `tresdb`. Note that this user needs to be created into `tresdb` database instead of `admin`. Thus, authenticate first on `admin`, and then switch to `tresdb` to create.

    > use admin
    > db.auth('mongoadmin', 'mongoadminpwd')
    > use tresdb
    > db.createUser({ user: 'mongouser', pwd: 'mongouserpwd', roles: ['readWrite'] })

Then in similar manner, create the test user that can access only 'test':

    > use test
    > db.createUser({ user: 'mongouser', pwd: 'mongouserpwd', roles: ['readWrite'] })

Press `ctrl + d` to quit `mongo` client.

Modify `mongo.url` and `mongo.testUrl` properties in `config/index.js` to include the new credentials of the database users:

    ...
    mongo: {
      url: 'mongodb://mongouser:mongouserpwd@localhost:27017/tresdb',
      testUrl: 'mongodb://mongouser:mongouserpwd@localhost:27017/test'
    }
    ...

From now on, you can and you should run mongod with authentication:

    $ mongod --auth --dbpath=.data/db

or alternatively just `$ npm run mongod`.



## Production

Here are some notes and tips for putting your TresDB app into production.


### Check dependencies for vulnerabilities

    $ npm install nsp -g
    $ nsp check

### Run in production environment

    $ npm run server:production

### Recommendation: use pm2 for process management

    $ pm2 restart ecosystem.json



## Technology stack

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/): maps and markers
- [Marked](https://github.com/markedjs/marked): markdown parser
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
- [MongoDB](https://docs.mongodb.com/manual/): document database

Development tools:

- [ESLint](http://eslint.org/): linting
- [Mocha](https://mochajs.org/): test runner
- [Should](http://shouldjs.github.io/): assertions

For production, we recommend:

- [DigitalOcean](https://m.do.co/c/3e63e3de8e31): cloud servers
- [Nginx](https://www.nginx.com/): reverse proxy
- [Let's Encrypt](https://letsencrypt.org/): TLS certificates



# Testing

First, we need to create a database `test` for tests and a database user. See [MongoDB user setup](#mongodb-user-setup) for instructions.

After creation, fire up mongod:

    $ npm run mongod

Then, open a new terminal session and fire up the server in the test environment:

    $ npm run server:test

Finally, open yet another terminal session and run the full test suite:

    $ npm test

See `package.json` for test suite details.


## Populate from a remote database

It is sometimes useful to clone a collection from a remote production database for local testing. Here are some tips how to do that with [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) and [mongoimport](https://docs.mongodb.com/manual/reference/program/mongoimport/).

First, ensure your production database and the local development database share identical versions. We have experienced weird errors about missing libssl files when attempting to clone between different versions.

    $ mongod --version

Second, we need to connect to the production database. Often the remote database cannot be accessed directly. Either login to the production server shell or alternatively forward a local port to the remote database so that it acts like a local one. For the latter a SSH tunnel is needed.

    $ ssh -L 27018:localhost:27017 123.123.123.123

Third, we [mongoexport](https://docs.mongodb.com/manual/reference/program/mongoexport/) a remote collection and save it as a local JSON file:

    $ mongoexport --host localhost:27018 --username remoteuser --password remoteword --db tresdb --collection locations --out tmp/locations.json

Repeat this for each collection you need. If you need all then repeat the above for `locations`, `users`, `events`, `entries`, and `config`.

Fourth, log out of production server or close the tunnel. If you exported the files on the production server, copy them to your local machine.

    $ scp 123.123.123.123:~/.tmp/locations.json .tmp/

Fifth, ensure your development database is running. Then [mongoimport](https://docs.mongodb.com/manual/reference/program/mongoimport/) the files to the database:

    $ mongoimport --username localfoouser --password localbarword --db tresdb --collection locations --file .tmp/locations.json

Use `--drop` flag if you need to clear each collection before importing.

Sixth, build indices for the imported data.

    $ npm run migrate

Finally, a bit of cleanup remains. Remove the temp files:

    $ rm .tmp/locations.json

As a result, our local locations collection is filled with locations from a production server.


## Testing error handling

There is two hidden URLs that cause an internal server error. The URLs are available for admin user only and thus require token authorisation. For now, you can find your token from the download URLs of Export feature.

    /api/admin/tests/throw-error?token=<jwt>
    /api/admin/tests/next-error?token=<jwt>



# Git branching strategy

We have a single `master` branch. New features are developed in `feature-somefeatname` like branches and then merged to the master via a pull request.

Small updates to documentation are allowed to be done directly to `master`.


## Versioning

On the master branch, we use the [semantic versioning](http://semver.org/) scheme. The semantic version increments are bound to the operations you need to do when upgrading your TresDB instance:

- MAJOR (+1.0.0) denotes a new incompatible feature. A database migration might be required after upgrade. Hyperlinks of earlier versions might not work.
- MINOR (+0.1.0) denotes a new backwards-compatible feature. Upgrading directly from the Git should not break anything.
- PATCH (+0.0.1) denotes a backwards-compatible bug fix. Upgrading or downgrading directly from the Git should not break anything.


## Issues

Report bugs and features to [GitHub issues](https://github.com/axelpale/tresdb/issues).

The issue labels follow [Drupal's issue priority levels](https://www.drupal.org/core/issue-priority): critical, major, normal, and minor.


## License

[MIT](LICENSE)
