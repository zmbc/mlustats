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
  _makePerformanceFromData: function(data, teamRecord, gameRecord, callback) {
    Players.findOrCreate(
      {mluApiId: data.PlayerID},
      {
        mluApiId: data.PlayerID,
        name: data.Player,
        team: teamRecord.id
      },
      function(err, playerRecord) {
        playerRecord.team = teamRecord.id;
        playerRecord.save();
        Performances.findOrCreate(
          {game: gameRecord.id, player: playerRecord.id},
          {
            game: gameRecord.id,
            player: playerRecord.id,
            team: teamRecord.id
          },
          function(err, performanceRecord) {
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
            
            performanceRecord.save(callback);
        });
    });
  },
  _createModelsFromGame: function(gameObj, callback) {
    Teams.findOrCreate(
      {mluApiId: gameObj[1][0].HomeTeamID},
      {
        mluApiId: gameObj[1][0].HomeTeamID,
        name: gameObj[0][0].HomeTeam,
        city: gameObj[0][0].HomeTeamCity,
        color: gameObj[0][0].HomeTeamColor
      },
      function(err, homeTeamRecord) {          
        Teams.findOrCreate(
          {mluApiId: gameObj[2][0].AwayTeamID},
          {
            mluApiId: gameObj[2][0].AwayTeamID,
            name: gameObj[0][0].AwayTeam,
            city: gameObj[0][0].AwayTeamCity,
            color: gameObj[0][0].AwayTeamColor
          },
          function(err, awayTeamRecord) {
            Games.findOrCreate(
              {
                mluApiId: gameObj[0][0].ga_id_pk,
                homeTeam: homeTeamRecord.id,
                awayTeam: awayTeamRecord.id
              },
              function(err, gameRecord) {
                var homePerformances = gameObj[5];
                var awayPerformances = gameObj[6];
                
                var numberParallel = homePerformances.length + awayPerformances.length;
                var numberDone = 0;
                
                homePerformances.forEach(function(element, index, array) {
                  self._makePerformanceFromData(element, homeTeamRecord, gameRecord, function(err, record) {
                    if (err) {
                      callback(err);
                    }
                    
                    numberDone++;
                    console.log(numberDone + ' of ' + numberParallel + ' performances complete');
                    
                    if (numberDone === numberParallel) {
                      callback();
                    }
                  });
                });
                
                awayPerformances.forEach(function(element, index, array) {
                  self._makePerformanceFromData(element, awayTeamRecord, gameRecord, function(err, record) {
                    if (err) {
                      callback(err);
                    }
                    
                    numberDone++;
                    console.log(numberDone + ' of ' + numberParallel + ' performances complete');
                    
                    if (numberDone === numberParallel) {
                      callback();
                    }
                  });
                });
            });
        }); 
    });
  },
  scrapeWeek: function(seasonAndWeek, callback) {
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
        
        var numberParallel = games.length;
        var numberDone = 0;
    
        games.forEach(function(element, index, array) {
          request('https://mlustats.herokuapp.com/api/score?gid=' + element.GameID, function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var gameData = JSON.parse(body).data;
              self._createModelsFromGame(gameData, function(err) {
                if (err) {
                  callback(err);
                }
                
                numberDone++;
                console.log(numberDone + ' of ' + numberParallel + ' games complete');
                
                if (numberDone === numberParallel) {
                  callback();
                }
              });
            }
          });
        });
      }
    });
  },
  scrapeCurrentWeek: function(callback) {
    var request = require('request');
    request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
      if (!error && response.statusCode == 200) {       
        var schedule = JSON.parse(body)[0];
        var currentWeek = self._maxSeasonAndWeek(schedule);
        
        self.scrapeWeek(currentWeek, callback);
      }
    });
  },
  scrapeAll: function(callback) {
    self.scrapeWeek('all', callback);
  }
};
