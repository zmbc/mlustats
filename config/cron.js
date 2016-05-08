module.exports.cron = {
	scrape: {
		schedule: '0 0 0 * * 1-5/2',
		onTick: function() {
			var request = require('request');
			request('https://mlustats.herokuapp.com/api/schedule?sid=4', function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				var moment = require('moment');
				
				var seasonSchedule = JSON.parse(body)[0];
				for (var i = 0; i < seasonSchedule.length; i++) {
					var gameTime = moment(seasonSchedule[i].StartTime, 'dddd [-] MMM D, YYYY h:mmA Z');
					
				}
			  }
			})
		}
	}
};
