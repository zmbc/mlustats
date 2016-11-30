var request = require('request');
var moment = require('moment');
var zpad = require('zpad');

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
  _makePerformanceFromData: function(data, teamRecord, gameRecord, seasonId, callback) {
    Players.findOrCreate(
      {mluApiId: data.PlayerID},
      {
        mluApiId: data.PlayerID,
        name: data.Player,
        team: teamRecord.id
      },
      function(err, playerRecord) {
        if (err) {
          Players.findOne({mluApiId: data.PlayerID}, function(err, playerRecord) {
            if (err) {
              throw err;
            } else {
              makePerformance(playerRecord);
            }
          });
        } else {
          makePerformance(playerRecord);
        }
    });

    function makePerformance(playerRecord) {
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
          if (err) {
            throw err;
          }

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
            Statistics.createOrRefresh({week: -1, season: seasonId, player: playerRecord.id, team: -1}, function() {
              Statistics.createOrRefresh({week: -1, season: -1, player: playerRecord.id, team: -1}, function() {
                callback(err, record);
              });
            });
          });
      });
    }
  },
  _createModelsFromGame: function(gameObj, seasonId, weekId, callback) {
    var homeTeam;
    var awayTeam;
    var game;

    sails.log.verbose('Finding or creating teams');
    Teams.findOrCreate(
      {mluApiId: gameObj[1][0].HomeTeamID},
      {
        mluApiId: gameObj[1][0].HomeTeamID,
        name: gameObj[0][0].HomeTeam,
        city: gameObj[0][0].HomeTeamCity,
        color: gameObj[0][0].HomeTeamColor
      }, function(err, homeTeamRecord) {
        if (err) {
          Teams.findOne({mluApiId: gameObj[1][0].HomeTeamID}, function(err, homeTeamRecord) {
            if (err) {
              throw err;
            } else {
              findOrCreateAwayTeam(homeTeamRecord);
            }
          });
        } else {
          findOrCreateAwayTeam(homeTeamRecord);
        }
      });

    function findOrCreateAwayTeam(homeTeamRecord) {
      homeTeam = homeTeamRecord;
      Teams.findOrCreate(
        {mluApiId: gameObj[2][0].AwayTeamID},
        {
          mluApiId: gameObj[2][0].AwayTeamID,
          name: gameObj[0][0].AwayTeam,
          city: gameObj[0][0].AwayTeamCity,
          color: gameObj[0][0].AwayTeamColor
        }, function(err, awayTeamRecord) {
          if (err) {
            Teams.findOne({mluApiId: gameObj[2][0].AwayTeamID}, function(err, awayTeamRecord) {
              if (err) {
                throw err;
              } else {
                findOrCreateGame(awayTeamRecord);
              }
            });
          } else {
            findOrCreateGame(awayTeamRecord);
          }
        });
    }

    function findOrCreateGame(awayTeamRecord) {
      awayTeam = awayTeamRecord;
      sails.log.verbose('Finding or creating game');
      var dateSplit = gameObj[0][0].ga_start_time.split(" ");
      var offset = gameObj[0][0].ga_time_zone;
      var dateString = `${dateSplit[2]} ${dateSplit[3]} ${dateSplit[4]} ${dateSplit[5]} -${zpad(-offset)}00`;
      Games.findOrCreate(
        {
          mluApiId: gameObj[0][0].ga_id_pk,
          homeTeam: homeTeam.id,
          awayTeam: awayTeam.id,
          season: seasonId,
          week: weekId,
          date: moment(dateString, 'MMM D, YYYY h:mmA Z').toString()
        }, function(err, gameRecord) {
          if (err) {
            Games.findOne({mluApiId: gameObj[0][0].ga_id_pk}, function(err, gameRecord) {
              if (err) {
                throw err;
              } else {
                makePerformances(gameRecord);
              }
            });
          } else {
            makePerformances(gameRecord);
          }
        });
    }

    function makePerformances(gameRecord) {
      sails.log.verbose('Making performances');
      var homePerformances = gameObj[5];
      var awayPerformances = gameObj[6];

      var numberParallel = homePerformances.length + awayPerformances.length;
      var numberDone = 0;

      homePerformances.forEach(function(element, index, array) {
        sails.log.verbose('Making home performance ' + (index + 1) + ' of ' + array.length);
        self._makePerformanceFromData(element, homeTeam, gameRecord, seasonId, function(err, record) {
          if (err) {
            callback(err);
          }

          numberDone++;
          sails.log.verbose(numberDone + ' of ' + numberParallel + ' performances complete');

          if (numberDone === numberParallel) {
            makeStatistics();
          }
        });
      });

      awayPerformances.forEach(function(element, index, array) {
        sails.log.verbose('Making away performance ' + (index + 1) + ' of ' + array.length);
        game = gameRecord;
        self._makePerformanceFromData(element, awayTeam, gameRecord, seasonId, function(err, record) {
          if (err) {
            callback(err);
          }

          numberDone++;
          sails.log.verbose(numberDone + ' of ' + numberParallel + ' performances complete');

          if (numberDone === numberParallel) {
            makeStatistics();
          }
        });
      });
    }
    
    function makeStatistics() {
      sails.log.verbose('Updating weekly statistics for ' + awayTeam.name + ' and ' + homeTeam.name + ' and the league');
      Statistics.createOrRefresh({week: weekId, season: seasonId, team: homeTeam.id, player: -1}, function() {
        Statistics.createOrRefresh({week: weekId, season: seasonId, team: awayTeam.id, player: -1}, function() {
          Statistics.createOrRefresh({week: weekId, season: seasonId, team: -1, player: -1}, function() {
            sails.log.verbose('Updating season statistics for ' + awayTeam.name + ' and ' + homeTeam.name + ' and the league');
            Statistics.createOrRefresh({week: -1, season: seasonId, team: homeTeam.id, player: -1}, function() {
              Statistics.createOrRefresh({week: -1, season: seasonId, team: awayTeam.id, player: -1}, function() {
                Statistics.createOrRefresh({week: -1, season: seasonId, team: -1, player: -1}, callback);
              });
            });
          });
        });
      });
    }
  },
  scrapeWeek: function(week, season, callback) {
    var request = require('request');

    var numberParallel;
    var numberDone = 0;

    var url = 'https://mlustats.herokuapp.com/api/schedule';

    if (season) {
      url += '?sid=' + season;
    }

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var schedule = JSON.parse(body)[0];
        var games;

        if (week !== 'all') {
          games = schedule.filter(function(gameObj) {
            return gameObj.SeasonID === season &&
                gameObj.Week === week;
          });
        } else {
          games = schedule;
        }

        games = games.filter(function(gameObj) {
          return gameObj.Status === 'Final';
        });

        sails.log.debug('Beginning to scrape ' + games.length + ' games');

        numberParallel = games.length;

        games.forEach(function(game, index, array) {
          makeRequest(game, index);
        });
      }
    });

    function makeRequest(game, index) {
      var weekId = game.Week;
      var seasonId = game.SeasonID;
      request('https://mlustats.herokuapp.com/api/score?gid=' + game.GameID, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var gameData = JSON.parse(body).data;
          sails.log.verbose('Recieved data about game ' + (index + 1));
          self._createModelsFromGame(gameData, seasonId, weekId, function(err) {
            if (err) {
              callback(err);
            }

            numberDone++;
            sails.log.debug(numberDone + ' of ' + numberParallel + ' games complete');

            if (numberDone === numberParallel) {
              Statistics.updatePercentiles(callback);
            }
          });
        }
      });
    }
  },
  scrapeCurrentWeek: function(callback) {
    var request = require('request');
    request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
      if (!error && response.statusCode == 200) {       
        var schedule = JSON.parse(body)[0];
        var currentWeek = self._maxSeasonAndWeek(schedule);
        
        self.scrapeWeek(currentWeek.week, currentWeek.season, callback);
      }
    });
  },
  scrapeSeason: function(season, callback) {
    self.scrapeWeek('all', season, callback);
  }
};
