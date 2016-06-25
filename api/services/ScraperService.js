self = module.exports = {
	_maxSeasonAndWeek: function(schedule) {
		var result = {season: 0, week: 0};
			for(var i = 0; i < schedule.length; i++) {
				if (schedule[i].Status === 'Final') {
					if (schedule[i].SeasonID > result.season) {
						result.season = schedule[i].SeasonID;
						result.week = 0;
					}
					
					if (schedule[i].Week > result.week) {
						result.week = schedule[i].Week;
					}
				}
			}
			
			return result;
	},
	_makePerformanceFromData: function(data, teamRecord, gameRecord) {
		Players.findOrCreate(
			{mluApiId: data.PlayerID},
			{
				mluApiId: data.PlayerID,
				name: data.Player
			},
			function(err, playerRecord) {
				playerRecord.team = teamRecord.id;
				playerRecord.save();
				Performances.findOrCreate({game: gameRecord.id, player: playerRecord.id}, function(err, performanceRecord) {
					performanceRecord.team = teamRecord.id;
					
					performanceRecord.goals = data.Goals;
					performanceRecord.assists = data.Assists;
					performanceRecord.hockeyAssists = data.HockeyAssists;
					performanceRecord.blocks = data.Blocks;
					performanceRecord.throws = data.Throws;
					performanceRecord.throwaways = data.Throwaways;
					performanceRecord.throwsIntoBlocks = data.ThrowIntoBlocks;
					performanceRecord.catches = data.Catches;
					performanceRecord.callahans = data.Callahans;
					performanceRecord.drops = data.Drops;
					performanceRecord.fouls = data.Fouls;
					performanceRecord.travels = data.Travels;
					performanceRecord.stalls = data.Stalls;
					performanceRecord.offensivePointsPlayed = data.OPointsPlayed;
					performanceRecord.defensivePointsPlayed = data.DPointsPlayed;
					
					var touches = data.Throws + data.Stalls + data.Goals;
					
					performanceRecord.offensivePossessions = Math.round(touches / parseFloat(data.TPOP));
					
					performanceRecord.save();
				});
		});
	},
	scrapeWeek: function(seasonAndWeek) {
		var request = require('request');
		request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var schedule = JSON.parse(body)[0];
				var games;
				
				if (seasonAndWeek !== 'all') {
					games = schedule.filter(function(gameObj) {
						return gameObj.SeasonID === seasonAndWeek.season &&
								gameObj.Week === seasonAndWeek.week;
					});
				} else {
					games = schedule;
				}
		
				games.forEach(function(element, index, array) {
					request('https://mlustats.herokuapp.com/api/score?gid=' + element.GameID, function(error, response, body) {
						if (!error && response.statusCode == 200) {
							var gameData = JSON.parse(body).data;
							Games.findOrCreate({mluApiId: gameData[0][0].ga_id_pk}, function(err, gameRecord) {
								Teams.findOrCreate(
									{mluApiId: gameData[1][0].HomeTeamID},
									{
										mluApiId: gameData[1][0].HomeTeamID,
										name: gameData[0][0].HomeTeam,
										city: gameData[0][0].HomeTeamCity,
										color: gameData[0][0].HomeTeamColor
									},
									function(err, homeTeamRecord) {
										gameRecord.homeTeam = homeTeamRecord.id;
										
										Teams.findOrCreate(
											{mluApiId: gameData[2][0].AwayTeamID},
											{
												mluApiId: gameData[2][0].AwayTeamID,
												name: gameData[0][0].AwayTeam,
												city: gameData[0][0].AwayTeamCity,
												color: gameData[0][0].AwayTeamColor
											},
											function(err, awayTeamRecord) {
												gameRecord.awayTeam = awayTeamRecord.id;
												gameRecord.save();
												
												var homePerformances = gameData[5];
												var awayPerformances = gameData[6];
												
												homePerformances.forEach(function(element, index, array) {
													self._makePerformanceFromData(element, homeTeamRecord, gameRecord);
												});
												
												awayPerformances.forEach(function(element, index, array) {
													self._makePerformanceFromData(element, awayTeamRecord, gameRecord);
												});
											});
									}); 
							});
						}
					});
				});
			}
		});
	},
	scrapeCurrentWeek: function() {
		var request = require('request');
		request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
			if (!error && response.statusCode == 200) {				
				var schedule = JSON.parse(body)[0];
				var currentWeek = self._maxSeasonAndWeek(schedule);
				
				self.scrapeWeek(currentWeek);
			}
		});
	},
	scrapeAll: function() {
		self.scrapeWeek('all');
	}
};
