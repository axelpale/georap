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

First, fire up mongo and node, then, run casperjs tests:

    $ npm test

## Production

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

Restart mongod with authentication:

    $ mongod --auth --dbpath=.data/db

Next, create a user with permission to access only `tresdb`. Note that this user needs to be created into `tresdb` database instead of `admin`. Thus, change first to `admin` to authenticate, and then to `tresdb` to create.

    $ mongo
    > use admin
    > db.auth('foodmin', 'barword')
    > use tresdb
    > db.createUser({
      user: 'foo',
      pwd: 'bar',
      roles: [{ role: 'readWrite', db: 'tresdb' }]
    })

Modify `mongo.url` property in `config/local.js` to include the new credentials:

    ...
    mongo: {
      url: 'mongodb://foo:bar@localhost:27017/tresdb'
    }
    ...

## Technology stack

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
- [Bootstrap](http://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)
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
- [Webpack](https://webpack.github.io/)

## License

MIT
