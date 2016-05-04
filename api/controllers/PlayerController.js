/**
 * PlayerController
 *
 * @description :: Server-side logic for managing Players
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	view: function(req, res) {
		Player.findOrCreate({name: 'Joe Smith'})
			.exec(function(err, record) {
				res.view('view.ejs', {player: record});
			});
	}
};

