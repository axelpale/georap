# tresdb

Esoteric Location CMS built on Express.

## Install

Clone the repository:

    $ git clone https://github.com/axelpale/tresdb.git

Install MongoDB by following [the instructions](https://www.mongodb.org/downloads). For example, on OS X:

    $ brew install mongodb

Install dependencies:

    $ npm install

Create `config/local.js` similar to:

    exports.secret = 'my-secret-for-authentication';

## Quick start

First, start MongoDB:

    $ mongod --dbpath=.data

Second, start the Node server:

    $ npm start

Finally, browse to [localhost:3000](http://localhost:3000).

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
- [Webpack](https://webpack.github.io/)

## License

MIT
