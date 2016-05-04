/**
 * PlayerController
 *
 * @description :: Server-side logic for managing Players
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	view: function(req, res) {
		Player.findOne(req.param('id'))
			.populate('team')
			.exec(function(err, playerRecord) {
				if (typeof playerRecord === 'undefined' || playerRecord === null) {
					res.notFound();
				} else {
					res.view('view.ejs', {player: playerRecord});
				}
			});
	}
};

