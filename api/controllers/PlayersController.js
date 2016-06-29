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
      .populate('performances')
      .exec(function(err, playerRecord) {
        if (typeof playerRecord === 'undefined' || playerRecord === null) {
          res.notFound();
        } else {
          playerRecord.performances = playerRecord.performances.slice(0, 10);
          res.view('players/view.ejs', {player: playerRecord});
        }
      });
  }
};

