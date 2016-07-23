/**
 * PlayersController
 *
 * @description :: Server-side logic for managing Players
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');

module.exports = {
  view: function(req, res) {
    var playerPromise = Players.findOne(req.params.id).populate('team').catch(res.notFound);
    var statsPromise = Players.statistics(req.params.id);

    Promise.all([playerPromise, statsPromise])
      .spread(function(player, stats) {
        res.view({player: player, stats: stats, clientVars: {stats: stats}});
      })
      .catch(res.serverError);
  }
};
