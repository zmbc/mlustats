/**
 * PlayersController
 *
 * @description :: Server-side logic for managing Players
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  view: function(req, res) {
    Players.findOne(req.params.id)
      .populate('team')
      .exec(function(err, playerRecord) {
        if (typeof playerRecord === 'undefined' || playerRecord === null) {
          res.notFound();
        } else {
          Statistics.findOne({player: playerRecord.id, week: null, season: 1, team: null}).exec(function (err, statsRecord) {
            res.view('players/view.jade', {player: playerRecord, stats: statsRecord});
          });
        }
      });
  }
};

