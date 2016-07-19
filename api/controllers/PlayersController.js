/**
 * PlayersController
 *
 * @description :: Server-side logic for managing Players
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var Promise = require('bluebird');

module.exports = {
  view: function(req, res) {
    var playerPromise = Players.findOne(req.params.id).populate('team');

    var statsPromise = playerPromise.then(function(playerRecord) {
      if (typeof playerRecord === 'undefined' || playerRecord === null) {
        res.notFound();
      } else {
        return Statistics.findOne({player: playerRecord.id, week: null, season: 1, team: null});
      }
    })
    .catch(function(error) {
      sails.log(error);
      res.serverError();
    });

    Promise.all([playerPromise, statsPromise]).spread(function(playerRecord, statsRecord) {
      res.view('players/view.jade', {player: playerRecord, stats: statsRecord});
    })
    .catch(function(error) {
      sails.log(error);
      res.serverError();
    });
  }
};
