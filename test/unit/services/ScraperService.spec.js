describe('The MLU API', function() {
  // Replacing supertest
  var request = require('request');

  describe('schedule endpoint', function() {
    it('should return the games in a format we understand', function(done) {
      this.timeout(10000);
      request('https://mlustats.herokuapp.com/api/schedule', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var schedule = JSON.parse(body)[0];
          schedule.forEach(function(game, index, array) {
            game.SeasonID.should.be.type('number');
            game.GameID.should.be.type('number');
            game.Status.should.be.type('string');
            game.Week.should.be.type('number');
          });
          done();
        } else {
          done(error);
        }
      });
    });
  });

  describe('the game endpoint', function() {
    it('should return the data in a format we understand', function(done) {
      this.timeout(10000);
      request('https://mlustats.herokuapp.com/api/score?gid=15', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body).data;
          var gameInfo = data[0][0];
          gameInfo.ga_id_pk.should.equal(15);
          gameInfo.Status.should.be.type('string');
          gameInfo.HomeTeamColor.should.be.type('string');
          gameInfo.AwayTeamColor.should.be.type('string');
          var homeTeamInfo = data[1][0];
          homeTeamInfo.HomeTeamID.should.be.type('number');
          var awayTeamInfo = data[2][0];
          awayTeamInfo.AwayTeamID.should.be.type('number');

          var validatePerformance = function(performance) {
            performance.PlayerID.should.be.type('number');
            performance.Player.should.be.type('string');
            performance.Team.should.be.type('string');
            performance.Goals.should.be.type('number');
            performance.Assists.should.be.type('number');
            performance.HockeyAssists.should.be.type('number');
            performance.Blocks.should.be.type('number');
            performance.Bookends.should.be.type('number');
            performance.Bands.should.be.type('number');
            performance.Throws.should.be.type('number');
            performance.Completions.should.be.type('number');
            performance.Catches.should.be.type('number');
            performance.Callahans.should.be.type('number');
            performance.Drops.should.be.type('number');
            performance.Throwaways.should.be.type('number');
            performance.ThrowIntoBlocks.should.be.type('number');
            performance.Fouls.should.be.type('number');
            performance.Travels.should.be.type('number');
            performance.Stalls.should.be.type('number');
            performance.TPOP.should.be.type('string');
            performance.OPointsPlayed.should.be.type('number');
            performance.DPointsPlayed.should.be.type('number');
            performance.OSE.should.be.type('string');
            performance.DSE.should.be.type('string');
          };

          var homePerformances = data[5];
          homePerformances.forEach(function(performance, index, array) {
            validatePerformance(performance);
            performance.Team.should.equal(gameInfo.HomeTeam);
          });

          var awayPerformances = data[6];
          awayPerformances.forEach(function(performance, index, array) {
            validatePerformance(performance);
            performance.Team.should.equal(gameInfo.AwayTeam);
          });

          var points = data[8];
          // As of now, we don't do anything with this data, so we don't
          // depend on it.

          done();
        } else {
          done(error);
        }
      });
    });
  });
});

describe('ScraperService', function() {
  afterEach(function(done) {
    // Clean up after
    this.timeout(10000);
    Performances.destroy().exec(function(err) {
      Games.destroy().exec(function(err) {
        Teams.destroy({name: {'!': 'Fake Team'}}).exec(function(err) {
          Players.destroy({name: {'!': 'Fake Name'}}).exec(function(err) {
            Statistics.destroy().exec(done);
          });
        });
      });
    });
  });

  describe('#scrapeCurrentWeek', function() {
    it ('should save valid data', function(done) {
      // This is a very long-running test as it involves a ton of database IO
      this.timeout(60000);

      // This test is essentially an integration test: it looks for anything going
      // really wrong with running scrapeCurrentWeek. Most of this "test" isn't
      // even here in the test: the required attributes on the models do the heavy lifting.
      // The only assertions that should be here are ones that can't be validated
      // on the database end.
      ScraperService.scrapeCurrentWeek(function() {
        Players.find().populate('team').populate('performances').exec(function(err, players) {
          players.forEach(function(player, index, array) {
            if (player.name !== 'Fake Name') {
              player.performances.length.should.equal(1);
            }
          });

          Teams.find().populate('players').exec(function(err, teams) {
            teams.forEach(function(team, index, array) {
              if (team.name !== 'Fake Team') {
                // The very least number of players that could have
                // possibly played this week for a team.
                team.players.length.should.be.aboveOrEqual(7);
              }
            });

            Performances.find().exec(function(err, performances) {
              var positiveAttrs = [
                'goals',
                'assists',
                'hockeyAssists',
                'blocks',
                'throws',
                'throwaways',
                'throwsIntoBlocks',
                'catches',
                'callahans',
                'drops',
                'fouls',
                'travels',
                'stalls',
                'offensivePointsPlayed',
                'defensivePointsPlayed'
              ];

              performances.forEach(function(performance, index, array) {
                positiveAttrs.forEach(function(attr, attrIndex, attrArray) {
                  performance[attr].should.be.aboveOrEqual(0);
                });
              });
              done();
            });
          });
        });
      });
    });
  });

  describe('_createModelsFromGame', function() {
    it('should make database entries that correspond to the input', function(done) {
      this.timeout(10000);

      ScraperService._createModelsFromGame([
        [
          {
            ga_id_pk: 12,
            ga_week: 2,
            SeasonID: 3,
            HomeTeam: "Home Team Name",
            AwayTeam: "Away Team Name",
            HomeTeamColor: "blue",
            AwayTeamColor: "green",
            HomeTeamCity: "Home Team City",
            AwayTeamCity: "Away Team City",
            Status: "Final"
          }
        ],
        [
          {
            HomeTeamID: 8
          }
        ],
        [
          {
            AwayTeamID: 4
          }
        ],
        // These team stats are completely redundant and unused
        [],
        [],
        [
          {
            PlayerID: 45,
            Player: "Home Team Player 1",
            Team: "Home Team Name",
            Goals: 4,
            Assists: 7,
            HockeyAssists: 0,
            Blocks: 2,
            Bookends: 1,
            Throws: 12,
            Completions: 9,
            Catches: 10,
            Callahans: 0,
            Drops: 1,
            Throwaways: 1,
            ThrowIntoBlocks: 2,
            Fouls: 1,
            Travels: 0,
            Stalls: 0,
            TPOP: "1.067",
            OPointsPlayed: 16,
            DPointsPlayed: 3,
            OSE: "50.0",
            DSE: "50.0"
          },
          {
            PlayerID: 48,
            Player: "Home Team Player 2",
            Team: "Home Team Name",
            Goals: 2,
            Assists: 9,
            HockeyAssists: 3,
            Blocks: 1,
            Bookends: 0,
            Throws: 16,
            Completions: 13,
            Catches: 15,
            Callahans: 0,
            Drops: 0,
            Throwaways: 1,
            ThrowIntoBlocks: 0,
            Fouls: 0,
            Travels: 0,
            Stalls: 0,
            TPOP: "1.500",
            OPointsPlayed: 4,
            DPointsPlayed: 14,
            OSE: "25.0",
            DSE: "41.7"
          }
        ],
        [
          {
            PlayerID: 64,
            Player: "Away Team Player 1",
            Team: "Away Team Name",
            Goals: 7,
            Assists: 3,
            HockeyAssists: 4,
            Blocks: 0,
            Bookends: 2,
            Throws: 18,
            Completions: 15,
            Catches: 7,
            Callahans: 1,
            Drops: 2,
            Throwaways: 3,
            ThrowIntoBlocks: 1,
            Fouls: 0,
            Travels: 1,
            Stalls: 0,
            TPOP: "1.190",
            OPointsPlayed: 13,
            DPointsPlayed: 6,
            OSE: "58.3",
            DSE: "66.7"
          },
          {
            PlayerID: 67,
            Player: "Away Team Player 2",
            Team: "Away Team Name",
            Goals: 11,
            Assists: 4,
            HockeyAssists: 2,
            Blocks: 3,
            Bookends: 0,
            Throws: 6,
            Completions: 5,
            Catches: 16,
            Callahans: 0,
            Drops: 1,
            Throwaways: 0,
            ThrowIntoBlocks: 2,
            Fouls: 0,
            Travels: 0,
            Stalls: 1,
            TPOP: "0.783",
            OPointsPlayed: 18,
            DPointsPlayed: 3,
            OSE: "88.2",
            DSE: "50.0"
          }
        ]
      ],
      // Season and week
      {id: 1},
      {id: 1},
      function() {
        Teams
          .find({name: {'!': 'Fake Team'}})
          .sort('mluApiId asc')
          .populate('players')
          .populate('performances')
          .exec(function(err, teams) {
            teams.length.should.equal(2);

            teams[0].mluApiId.should.equal('4');
            teams[0].name.should.equal('Away Team Name');
            teams[0].city.should.equal('Away Team City');
            teams[0].color.should.equal('green');

            teams[1].mluApiId.should.equal('8');
            teams[1].name.should.equal('Home Team Name');
            teams[1].city.should.equal('Home Team City');
            teams[1].color.should.equal('blue');

            teams[0].players.length.should.equal(2);
            teams[0].players.forEach(function(player, index, array) {
              ['67', '64'].should.containEql(player.mluApiId);
              if (player.mluApiId === '64') {
                player.name.should.equal('Away Team Player 1');
              } else {
                player.name.should.equal('Away Team Player 2');
              }
            });

            teams[1].players.length.should.equal(2);
            teams[1].players.forEach(function(player, index, array) {
              ['45', '48'].should.containEql(player.mluApiId);
              if (player.mluApiId === '45') {
                player.name.should.equal('Home Team Player 1');
              } else {
                player.name.should.equal('Home Team Player 2');
              }
            });

            teams[0].performances.length.should.equal(2);
            teams[0].performances.forEach(function(performance, index, array) {
              teams[0].players.forEach(function(player, playerIndex, playerArray) {
                if (player.id === performance.player) {
                  if (player.name === 'Away Team Player 1') {
                    performance.goals.should.equal(7);
                    performance.assists.should.equal(3);
                    performance.hockeyAssists.should.equal(4);
                    performance.blocks.should.equal(0);
                    performance.bookends.should.equal(2);
                    performance.throws.should.equal(18);
                    performance.completions.should.equal(15);
                    performance.catches.should.equal(7);
                    performance.callahans.should.equal(1);
                    performance.drops.should.equal(2);
                    performance.throwaways.should.equal(3);
                    performance.throwsIntoBlocks.should.equal(1);
                    performance.fouls.should.equal(0);
                    performance.travels.should.equal(1);
                    performance.stalls.should.equal(0);
                    performance.offensivePointsPlayed.should.equal(13);
                    performance.defensivePointsPlayed.should.equal(6);
                    performance.offensivePossessionsPlayed.should.equal(21);
                    performance.offensivePointsScored.should.equal(7);
                    performance.offensivePointsScoredOn.should.equal(5);
                    performance.defensivePointsScored.should.equal(4);
                    performance.defensivePointsScoredOn.should.equal(2);
                  } else {
                    performance.goals.should.equal(11);
                    performance.assists.should.equal(4);
                    performance.hockeyAssists.should.equal(2);
                    performance.blocks.should.equal(3);
                    performance.bookends.should.equal(0);
                    performance.throws.should.equal(6);
                    performance.completions.should.equal(5);
                    performance.catches.should.equal(16);
                    performance.callahans.should.equal(0);
                    performance.drops.should.equal(1);
                    performance.throwaways.should.equal(0);
                    performance.throwsIntoBlocks.should.equal(2);
                    performance.fouls.should.equal(0);
                    performance.travels.should.equal(0);
                    performance.stalls.should.equal(1);
                    performance.offensivePointsPlayed.should.equal(18);
                    performance.defensivePointsPlayed.should.equal(3);
                    performance.offensivePossessionsPlayed.should.equal(23);
                    performance.offensivePointsScored.should.equal(15);
                    performance.offensivePointsScoredOn.should.equal(2);
                    performance.defensivePointsScored.should.equal(1);
                    performance.defensivePointsScoredOn.should.equal(1);
                  }
                }
              });
            });

            teams[1].performances.length.should.equal(2);
            teams[1].performances.forEach(function(performance, index, array) {
              teams[1].players.forEach(function(player, playerIndex, playerArray) {
                if (player.id === performance.player) {
                  if (player.name === 'Home Team Player 1') {
                    performance.goals.should.equal(4);
                    performance.assists.should.equal(7);
                    performance.hockeyAssists.should.equal(0);
                    performance.blocks.should.equal(2);
                    performance.bookends.should.equal(1);
                    performance.throws.should.equal(12);
                    performance.completions.should.equal(9);
                    performance.catches.should.equal(10);
                    performance.callahans.should.equal(0);
                    performance.drops.should.equal(1);
                    performance.throwaways.should.equal(1);
                    performance.throwsIntoBlocks.should.equal(2);
                    performance.fouls.should.equal(1);
                    performance.travels.should.equal(0);
                    performance.stalls.should.equal(0);
                    performance.offensivePointsPlayed.should.equal(16);
                    performance.defensivePointsPlayed.should.equal(3);
                    performance.offensivePossessionsPlayed.should.equal(15);
                    performance.offensivePointsScored.should.equal(8);
                    performance.offensivePointsScoredOn.should.equal(8);
                    performance.defensivePointsScored.should.equal(1);
                    performance.defensivePointsScoredOn.should.equal(1);
                  } else {
                    performance.goals.should.equal(2);
                    performance.assists.should.equal(9);
                    performance.hockeyAssists.should.equal(3);
                    performance.blocks.should.equal(1);
                    performance.bookends.should.equal(0);
                    performance.throws.should.equal(16);
                    performance.completions.should.equal(13);
                    performance.catches.should.equal(15);
                    performance.callahans.should.equal(0);
                    performance.drops.should.equal(0);
                    performance.throwaways.should.equal(1);
                    performance.throwsIntoBlocks.should.equal(0);
                    performance.fouls.should.equal(0);
                    performance.travels.should.equal(0);
                    performance.stalls.should.equal(0);
                    performance.offensivePointsPlayed.should.equal(4);
                    performance.defensivePointsPlayed.should.equal(14);
                    performance.offensivePossessionsPlayed.should.equal(12);
                    performance.offensivePointsScored.should.equal(1);
                    performance.offensivePointsScoredOn.should.equal(3);
                    performance.defensivePointsScored.should.equal(5);
                    performance.defensivePointsScoredOn.should.equal(7);
                  }
                }
              });
            });

            Games.find(teams[0].performances[0].game).populate('week').exec(function(err, game) {
              game = game[0];
              Statistics.find().exec(function(err, statsRecords) {
                // 1 for each player for the season
                // 1 for each team for the week
                // 1 for each team for the season
                // 1 for the whole league for the week
                // 1 for the whole league for the season
                statsRecords.length.should.equal(4 + 2 + 2 + 1 + 1);

                var player1Stats = statsRecords
                  .filter(function(value) {
                    return value.season ===  game.week.season && value.player === teams[0].players[0].id;
                  })[0];

                player1Stats.goals.should.equal(7);
                player1Stats.assists.should.equal(3);
                player1Stats.hockeyAssists.should.equal(4);
                player1Stats.blocks.should.equal(0);
                player1Stats.bookends.should.equal(2);
                player1Stats.throws.should.equal(18);
                player1Stats.completions.should.equal(15);
                player1Stats.catches.should.equal(7);
                player1Stats.callahans.should.equal(1);
                player1Stats.drops.should.equal(2);
                player1Stats.throwaways.should.equal(3);
                player1Stats.throwsIntoBlocks.should.equal(1);
                player1Stats.fouls.should.equal(0);
                player1Stats.travels.should.equal(1);
                player1Stats.stalls.should.equal(0);
                player1Stats.offensivePointsPlayed.should.equal(13);
                player1Stats.defensivePointsPlayed.should.equal(6);
                player1Stats.offensivePossessionsPlayed.should.equal(21);
                player1Stats.defensivePossessionsPlayed.should.equal(15);
                player1Stats.offensivePointsScored.should.equal(7);
                player1Stats.offensivePointsScoredOn.should.equal(5);
                player1Stats.offensivePlusMinus.should.equal(2);
                player1Stats.defensivePointsScored.should.equal(4);
                player1Stats.defensivePointsScoredOn.should.equal(2);
                player1Stats.defensivePlusMinus.should.equal(2);
                player1Stats.plusMinus.should.equal(4);
                player1Stats.touches.should.equal(25);
                // Per offensive possession
                player1Stats.goalsPerPoss.should.be.approximately(7 / 21, 0.01);
                player1Stats.assistsPerPoss.should.be.approximately(3 / 21, 0.01);
                player1Stats.hockeyAssistsPerPoss.should.be.approximately(4 / 21, 0.01);
                player1Stats.throwsPerPoss.should.be.approximately(18 / 21, 0.01);
                player1Stats.completionsPerPoss.should.be.approximately(15 / 21, 0.01);
                player1Stats.catchesPerPoss.should.be.approximately(7 / 21, 0.01);
                player1Stats.dropsPerPoss.should.be.approximately(2 / 21, 0.01);
                player1Stats.throwawaysPerPoss.should.be.approximately(3 / 21, 0.01);
                player1Stats.throwsIntoBlocksPerPoss.should.be.approximately(1 / 21, 0.01);
                player1Stats.travelsPerPoss.should.be.approximately(1 / 21, 0.01);
                player1Stats.stallsPerPoss.should.be.approximately(0 / 21, 0.01);
                player1Stats.touchesPerPoss.should.be.approximately(25 / 21, 0.01);
                // Per defensive possession
                player1Stats.blocksPerPoss.should.be.approximately(0 / 15, 0.01);
                player1Stats.callahansPerPoss.should.be.approximately(1 / 15, 0.01);
                player1Stats.bookendsPerPoss.should.be.approximately(2 / 15, 0.01);

                var awayTeamWeekStats = statsRecords
                  .filter(function(value) {
                    return value.week !== null && value.team !== null && value.week === game.week.id && value.team === teams[0].id;
                  })[0];

                awayTeamWeekStats.goals.should.equal(18);
                awayTeamWeekStats.assists.should.equal(7);
                awayTeamWeekStats.hockeyAssists.should.equal(6);
                awayTeamWeekStats.blocks.should.equal(3);
                awayTeamWeekStats.bookends.should.equal(2);
                awayTeamWeekStats.throws.should.equal(24);
                awayTeamWeekStats.completions.should.equal(20);
                awayTeamWeekStats.catches.should.equal(23);
                awayTeamWeekStats.callahans.should.equal(1);
                awayTeamWeekStats.drops.should.equal(3);
                awayTeamWeekStats.throwaways.should.equal(3);
                awayTeamWeekStats.throwsIntoBlocks.should.equal(3);
                awayTeamWeekStats.fouls.should.equal(0);
                awayTeamWeekStats.travels.should.equal(1);
                awayTeamWeekStats.stalls.should.equal(1);
                // These are actually decimal values (which shouldn't even exist
                // in the real world) but close enough.
                awayTeamWeekStats.offensivePointsPlayed.should.equal(4);
                awayTeamWeekStats.defensivePointsPlayed.should.equal(1);
                awayTeamWeekStats.offensivePossessionsPlayed.should.equal(6);
                awayTeamWeekStats.defensivePossessionsPlayed.should.equal(3);
                awayTeamWeekStats.offensivePointsScored.should.equal(3);
                awayTeamWeekStats.offensivePointsScoredOn.should.equal(1);
                awayTeamWeekStats.offensivePlusMinus.should.equal(2);
                awayTeamWeekStats.defensivePointsScored.should.equal(1);
                awayTeamWeekStats.defensivePointsScoredOn.should.equal(0);
                awayTeamWeekStats.defensivePlusMinus.should.equal(1);
                awayTeamWeekStats.plusMinus.should.equal(3);
                awayTeamWeekStats.touches.should.equal(43);
                // Per offensive possession
                // NB: Some of these are greater than 1 and should never be in the real world.
                awayTeamWeekStats.goalsPerPoss.should.be.approximately(18 / 6, 0.01);
                awayTeamWeekStats.assistsPerPoss.should.be.approximately(7 / 6, 0.01);
                awayTeamWeekStats.hockeyAssistsPerPoss.should.be.approximately(6 / 6, 0.01);
                awayTeamWeekStats.throwsPerPoss.should.be.approximately(24 / 6, 0.01);
                awayTeamWeekStats.completionsPerPoss.should.be.approximately(20 / 6, 0.01);
                awayTeamWeekStats.catchesPerPoss.should.be.approximately(23 / 6, 0.01);
                awayTeamWeekStats.dropsPerPoss.should.be.approximately(3 / 6, 0.01);
                awayTeamWeekStats.throwawaysPerPoss.should.be.approximately(3 / 6, 0.01);
                awayTeamWeekStats.throwsIntoBlocksPerPoss.should.be.approximately(3 / 6, 0.01);
                awayTeamWeekStats.travelsPerPoss.should.be.approximately(1 / 6, 0.01);
                awayTeamWeekStats.stallsPerPoss.should.be.approximately(1 / 6, 0.01);
                awayTeamWeekStats.touchesPerPoss.should.be.approximately(43 / 6, 0.01);
                // Per defensive possession
                awayTeamWeekStats.blocksPerPoss.should.be.approximately(3 / 3, 0.01);
                awayTeamWeekStats.callahansPerPoss.should.be.approximately(1 / 3, 0.01);
                awayTeamWeekStats.bookendsPerPoss.should.be.approximately(2 / 3, 0.01);

                done();
              });
            });
          });
      });
    });
  });
});
