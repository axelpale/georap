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

## Technologies

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Socket.io](http://socket.io/)
- [MongoDB](https://docs.mongodb.com/manual/)
- [Webpack](https://webpack.github.io/)
- [Bootstrap](http://getbootstrap.com/)
- [bcrypt](https://www.npmjs.com/package/bcryptjs)
- [JSON Web Tokens](https://github.com/auth0/node-jsonwebtoken)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
- [jQuery](https://jquery.com/)
- [Lodash](https://lodash.com/)

## License

MIT
