module.exports = {
	scrapeCurrentWeek: function() {
		var maxSeasonAndWeek = function(schedule) {
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
		};
		
		var makePerformanceFromData = function(data, teamRecord, gameRecord) {
			Player.findOrCreate(
				{mluApiId: data['PlayerID']},
				{
					mluApiId: data['PlayerID'],
					name: data['Player']
				},
				function(err, playerRecord) {
					console.log(playerRecord);
					playerRecord.team = teamRecord.id;
					playerRecord.save();
					Performance.findOrCreate({game: gameRecord.id, player: playerRecord.id}, function(err, performanceRecord) {
						console.log(performanceRecord);
						performanceRecord.team = teamRecord.id;
						
						performanceRecord.goals = data['Goals'];
						performanceRecord.assists = data['Assists'];
						performanceRecord.hockeyAssists = data['HockeyAssists'];
						performanceRecord.blocks = data['Blocks'];
						performanceRecord.throws = data['Throws'];
						performanceRecord.throwaways = data['Throwaways'];
						performanceRecord.throwsIntoBlocks = data['ThrowIntoBlocks'];
						performanceRecord.catches = data['Catches'];
						performanceRecord.callahans = data['Callahans'];
						performanceRecord.drops = data['Drops'];
						performanceRecord.fouls = data['Fouls'];
						performanceRecord.travels = data['Travels'];
						performanceRecord.stalls = data['Stalls'];
						performanceRecord.turnovers = data['Turnovers'];
						performanceRecord.offensivePointsPlayed = data['OPointsPlayed'];
						performanceRecord.defensivePointsPlayed = data['DPointsPlayed'];
						
						performanceRecord.save();
					});
			});
		};
		
		var request = require('request');
		request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var moment = require('moment');
				
				var schedule = JSON.parse(body)[0];
				var currentWeek = maxSeasonAndWeek(schedule);
				var games = schedule.filter(function(gameObj) {
					return gameObj.SeasonID === currentWeek.season &&
							gameObj.Week === currentWeek.week;
				});
				
				games.forEach(function(element, index, array) {
					request('https://mlustats.herokuapp.com/api/score?gid=' + element.GameID, function(error, response, body) {
						if (!error && response.statusCode == 200) {
							var gameData = JSON.parse(body)['data'];
							Game.findOrCreate({mluApiId: gameData[0][0]['ga_id_pk']}, function(err, gameRecord) {
								Team.findOrCreate(
									{mluApiId: gameData[1][0]['HomeTeamID']},
									{
										mluApiId: gameData[1][0]['HomeTeamID'],
										name: gameData[0][0]['HomeTeam'],
										city: gameData[0][0]['HomeTeamCity']
									},
									function(err, homeTeamRecord) {
										gameRecord.homeTeam = homeTeamRecord.id;
										
										console.log('AwayTeamID=' + gameData[2][0]['AwayTeamID']);
										console.log('AwayTeam=' + gameData[0]['AwayTeam']);
										console.log('AwayTeamCity=' + gameData[0]['AwayTeamCity']);
										
										Team.findOrCreate(
											{mluApiId: gameData[2][0]['AwayTeamID']},
											{
												mluApiId: gameData[2][0]['AwayTeamID'],
												name: gameData[0][0]['AwayTeam'],
												city: gameData[0][0]['AwayTeamCity']
											},
											function(err, awayTeamRecord) {
												gameRecord.awayTeam = awayTeamRecord.id;
												gameRecord.save();
												
												var homePerformances = gameData[5];
												var awayPerformances = gameData[6];
												
												homePerformances.forEach(function(element, index, array) {
													makePerformanceFromData(element, homeTeamRecord, gameRecord);
												});
												
												awayPerformances.forEach(function(element, index, array) {
													makePerformanceFromData(element, awayTeamRecord, gameRecord);
												});
											});
									}); 
							});
						}
					});
				});
			}
		});
	}
};
