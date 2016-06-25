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
  describe('#scrapeCurrentWeek', function() {
    it ('should save valid data', function(done) {
      // This is a very long-running test as it involves a ton of database IO
      this.timeout(40000);

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
              // Clean up after
              Performances.destroy().exec(function(err) {
                Games.destroy().exec(function(err) {
                  Teams.destroy({name: {'!': 'Fake Team'}}).exec(function(err) {
                    Players.destroy({name: {'!': 'Fake Name'}}).exec(done);
                  });
                });
              });
              done();
            });
          });
        });
      });
    });
  });
});
