var request = require('request');

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
  _makePerformanceFromData: function(data, teamRecord, gameRecord, season, callback) {
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
            performanceRecord.bookends = data.Bookends;
            performanceRecord.throws = data.Throws;
            performanceRecord.completions = data.Completions;
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
            
            performanceRecord.offensivePossessionsPlayed = Math.round(touches / parseFloat(data.TPOP));

            var ose = parseFloat(data.OSE) / 100;
            var offensivePointsScored = data.OPointsPlayed * ose;
            var offensivePointsScoredOn = data.OPointsPlayed - offensivePointsScored;
            var i = 1;

            while (offensivePointsScored % 1 > 0.05 && offensivePointsScored % 1 < 0.95) {
              if (i > 4) {
                sails.log.warn('Offensive points won/lost cannot be calculated for player ' + data.Player);
                offensivePointsScored = null;
                offensivePointsScoredOn = null;
                break;
              }
              offensivePointsScored = (data.OPointsPlayed - i) * ose;
              offensivePointsScoredOn = (data.OPointsPlayed - i) - offensivePointsScored;
              i++;
            }

            if (offensivePointsScored !== null) {
              performanceRecord.offensivePointsScored = Math.round(offensivePointsScored);
            }

            if (offensivePointsScoredOn !== null) {
              performanceRecord.offensivePointsScoredOn = Math.round(offensivePointsScoredOn);
            }

            var dse = parseFloat(data.DSE) / 100;
            var defensivePointsScored = data.DPointsPlayed * dse;
            var defensivePointsScoredOn = data.DPointsPlayed - defensivePointsScored;
            var j = 1;

            while (defensivePointsScored % 1 > 0.05 && defensivePointsScored % 1 < 0.95) {
              if (j > 4) {
                sails.log.warn('Defensive points won/lost cannot be calculated for player ' + data.Player);
                defensivePointsScored = null;
                defensivePointsScoredOn = null;
                break;
              }
              defensivePointsScored = (data.DPointsPlayed - j) * dse;
              defensivePointsScoredOn = (data.DPointsPlayed - j) - defensivePointsScored;
              j++;
            }

            if (defensivePointsScored !== null) {
              performanceRecord.defensivePointsScored = Math.round(defensivePointsScored);
            }
            if (defensivePointsScoredOn !== null) {
              performanceRecord.defensivePointsScoredOn = Math.round(defensivePointsScoredOn);
            }

            performanceRecord.save(function(err, record) {
              Statistics.createOrRefresh({week: null, season: season.id, player: playerRecord.id, team: null}, function() {
                callback(err, record);
              });
            });
        });
    });
  },
  _createModelsFromGame: function(gameObj, season, week, callback) {
    var homeTeam;
    var awayTeam;
    var game;

    Teams.findOrCreate(
      {mluApiId: gameObj[1][0].HomeTeamID},
      {
        mluApiId: gameObj[1][0].HomeTeamID,
        name: gameObj[0][0].HomeTeam,
        city: gameObj[0][0].HomeTeamCity,
        color: gameObj[0][0].HomeTeamColor
      }, findOrCreateAwayTeam);

    function findOrCreateAwayTeam(err, homeTeamRecord) {
      homeTeam = homeTeamRecord;
      Teams.findOrCreate(
        {mluApiId: gameObj[2][0].AwayTeamID},
        {
          mluApiId: gameObj[2][0].AwayTeamID,
          name: gameObj[0][0].AwayTeam,
          city: gameObj[0][0].AwayTeamCity,
          color: gameObj[0][0].AwayTeamColor
        }, findOrCreateGame);
    }

    function findOrCreateGame(err, awayTeamRecord) {
      awayTeam = awayTeamRecord;
      Games.findOrCreate(
        {
          mluApiId: gameObj[0][0].ga_id_pk,
          homeTeam: homeTeam.id,
          awayTeam: awayTeam.id,
          week: week.id
        }, makePerformances);
    }

    function makePerformances(err, gameRecord) {
      var homePerformances = gameObj[5];
      var awayPerformances = gameObj[6];

      var numberParallel = homePerformances.length + awayPerformances.length;
      var numberDone = 0;

      homePerformances.forEach(function(element, index, array) {
        self._makePerformanceFromData(element, homeTeam, gameRecord, season, function(err, record) {
          if (err) {
            callback(err);
          }

          numberDone++;
          console.log(numberDone + ' of ' + numberParallel + ' performances complete');

          if (numberDone === numberParallel) {
            makeStatistics();
          }
        });
      });

      awayPerformances.forEach(function(element, index, array) {
        game = gameRecord;
        self._makePerformanceFromData(element, awayTeam, gameRecord, season, function(err, record) {
          if (err) {
            callback(err);
          }

          numberDone++;
          console.log(numberDone + ' of ' + numberParallel + ' performances complete');

          if (numberDone === numberParallel) {
            makeStatistics(gameRecord);
          }
        });
      });
    }
    
    function makeStatistics() {
      Statistics.createOrRefresh({week: game.week, season: null, team: homeTeam.id, player: null}, function() {
        Statistics.createOrRefresh({week: game.week, season: null, team: awayTeam.id, player: null}, function() {
          Statistics.createOrRefresh({week: game.week, season: null, team: null, player: null}, function() {
            Statistics.createOrRefresh({week: null, season: season.id, team: homeTeam.id, player: null}, function() {
              Statistics.createOrRefresh({week: null, season: season.id, team: awayTeam.id, player: null}, function() {
                Statistics.createOrRefresh({week: null, season: season.id, team: null, player: null}, callback);
              });
            });
          });
        });
      });
    }
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
        
        games = games.filter(function(gameObj) {
          return gameObj.Status === 'Final';
        });

        var numberParallel = games.length;
        var numberDone = 0;


        games.forEach(function(element, index, array) {
          Seasons.findOrCreate({mluApiId: element.SeasonID}, function(err, seasonRecord) {
            Weeks.findOrCreate({season: seasonRecord.id, weekNum: element.Week}, function(err, weekRecord) {
              request('https://mlustats.herokuapp.com/api/score?gid=' + element.GameID, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  var gameData = JSON.parse(body).data;
                  self._createModelsFromGame(gameData, seasonRecord, weekRecord, function(err) {
                    if (err) {
                      callback(err);
                    }

                    numberDone++;
                    console.log(numberDone + ' of ' + numberParallel + ' games complete');

                    if (numberDone === numberParallel) {
                      Statistics.updatePercentiles(callback);
                    }
                  });
                }
              });
            });
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
