/**
 * ClientController
 *
 * @description :: Server-side logic for managing clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  get: function (req, res) {
    return res.view('homepage', {
      title: 'TreStalkers Database'
    });
  }
};
