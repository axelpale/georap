# tresdb

Esoteric Location CMS built on Express.

## Install

Clone the repository:

    $ git clone https://github.com/axelpale/tresdb.git

Install MongoDB by following [the instructions](https://www.mongodb.org/downloads). For example, on OS X:

    $ brew install mongodb

Install dependencies:

    $ npm install

Rename `config/local-sample.js` to `config/local.js` and rewrite it with your settings.



## Quick start

First, start MongoDB (if it ever refuses to stop, try `killall mongod`):

    $ npm run mongo

Second, start the Node server:

    $ npm start

Finally, browse to [localhost:3000](http://localhost:3000).

## Testing

First, fire up mongo and node. Then, run full test suite:

    $ npm test

The test suite includes:

- Server API tests powered by **mocha**. Run separately by `$ npm run test:api`.
- Client-side UI tests powered by **casperjs**. Run separately by `$ npm run test:client`.

## Production

Here are some notes and tips for putting a TresDB instance into production.

### Secure MongoDB

Start mongod without authentication:

    $ mongod --dbpath=.data/db

Create an administrator that can add other users. For example, create a database user into `admin` database with `userAdminAnyDatabase` permission:

    $ mongo
    > use admin
    > db.createUser({
      user: 'foodmin',
      pwd: 'barword'
      roles: ['userAdminAnyDatabase']
    })

Next, create a user with permission to access only `tresdb`. Note that this user needs to be created into `tresdb` database instead of `admin`. Thus, authenticate first on `admin`, and then switch to `tresdb` to create.

    > db.auth('foodmin', 'barword')
    > use tresdb
    > db.createUser({
      user: 'foo',
      pwd: 'bar',
      roles: [{ role: 'readWrite', db: 'tresdb' }]
    })

Modify `mongo.url` property in `config/local.js` to include the new credentials of the `tresdb` database user:

    ...
    mongo: {
      url: 'mongodb://foo:bar@localhost:27017/tresdb'
    }
    ...

Now you can and should run mongod with authentication:

    $ mongod --auth --dbpath=.data/db



### Check dependencies for vulnerabilities

    $ npm install nsp -g
    $ nsp check

### Run in production environment

    $ npm run production


## Technology stack

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
- [Bootstrap](http://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)
- [Webpack](https://webpack.github.io/)
- [Socket.io](http://socket.io/)
- [bcrypt](https://www.npmjs.com/package/bcryptjs)
- [JSON Web Tokens](https://github.com/auth0/node-jsonwebtoken)
- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/en/)
- [Monk](https://github.com/Automattic/monk)
- [MongoDB](https://docs.mongodb.com/manual/)

Development tools:

- [ESLint](http://eslint.org/)
- [CasperJS](http://casperjs.org/)
- [Mocha](https://mochajs.org/)
- [Should](http://shouldjs.github.io/)



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
