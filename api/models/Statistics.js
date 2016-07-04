/**
 * Statistics.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    player: {
      model: 'players'
    },
    team: {
      model: 'teams'
    },
    season: {
      model: 'seasons'
    },
    week: {
      model: 'weeks'
    },
    goals: {
      type: 'integer'
    },
    assists: {
      type: 'integer'
    },
    hockeyAssists: {
      type: 'integer'
    },
    blocks: {
      type: 'integer'
    },
    bookends: {
      type: 'integer'
    },
    throws: {
      type: 'integer'
    },
    completions: {
      type: 'integer'
    },
    throwaways: {
      type: 'integer'
    },
    throwsIntoBlocks: {
      type: 'integer'
    },
    catches: {
      type: 'integer'
    },
    callahans: {
      type: 'integer'
    },
    drops: {
      type: 'integer'
    },
    fouls: {
      type: 'integer'
    },
    travels: {
      type: 'integer'
    },
    stalls: {
      type: 'integer'
    },
    offensivePossessionsPlayed: {
      type: 'integer'
    },
    offensivePointsPlayed: {
      type: 'integer'
    },
    defensivePointsPlayed: {
      type: 'integer'
    },
    offensivePointsScored: {
      type: 'integer'
    },
    offensivePointsScoredOn: {
      type: 'integer'
    },
    defensivePointsScored: {
      type: 'integer'
    },
    defensivePointsScoredOn: {
      type: 'integer'
    },
    offensivePlusMinus: {
      type: 'integer'
    },
    defensivePlusMinus: {
      type: 'integer'
    },
    plusMinus: {
      type: 'integer'
    },
    touches: {
      type: 'integer'
    },
    defensivePossessionsPlayed: {
      type: 'integer'
    },
    // Per-possession stats
    goalsPerPoss: {
      type: 'float'
    },
    assistsPerPoss: {
      type: 'float'
    },
    hockeyAssistsPerPoss: {
      type: 'float'
    },
    throwsPerPoss: {
      type: 'float'
    },
    completionsPerPoss: {
      type: 'float'
    },
    throwawaysPerPoss: {
      type: 'float'
    },
    throwsIntoBlocksPerPoss: {
      type: 'float'
    },
    catchesPerPoss: {
      type: 'float'
    },
    dropsPerPoss: {
      type: 'float'
    },
    travelsPerPoss: {
      type: 'float'
    },
    stallsPerPoss: {
      type: 'float'
    },
    touchesPerPoss: {
      type: 'float'
    },
    blocksPerPoss: {
      type: 'float'
    },
    callahansPerPoss: {
      type: 'float'
    },
    bookendsPerPoss: {
      type: 'float'
    },
    // Percentiles
    goalsPerPossPercentile: {
      type: 'integer'
    },
    assistsPerPossPercentile: {
      type: 'integer'
    },
    hockeyAssistsPerPossPercentile: {
      type: 'integer'
    },
    throwsPerPossPercentile: {
      type: 'integer'
    },
    completionsPerPossPercentile: {
      type: 'integer'
    },
    throwawaysPerPossPercentile: {
      type: 'integer'
    },
    throwsIntoBlocksPerPossPercentile: {
      type: 'integer'
    },
    catchesPerPossPercentile: {
      type: 'integer'
    },
    dropsPerPossPercentile: {
      type: 'integer'
    },
    travelsPerPossPercentile: {
      type: 'integer'
    },
    stallsPerPossPercentile: {
      type: 'integer'
    },
    touchesPerPossPercentile: {
      type: 'integer'
    },
    blocksPerPossPercentile: {
      type: 'integer'
    },
    callahansPerPossPercentile: {
      type: 'integer'
    },
    bookendsPerPossPercentile: {
      type: 'integer'
    }
  },
  createOrRefresh: function(opts, cb) {
    Statistics.findOne(opts).exec(function(err, self) {
      if (self) {
        Statistics.refreshStatistics(self, function(err) {
          if (err) cb(err);
          self.save(function(err) {
            if (err) cb(err);
            cb(null, self);
          });
        });
      } else {
        Statistics.create(opts).exec(cb);
      }
    });
  },
  refreshDerivativeStatistics: function(self) {
    if (self.offensivePointsScored !== null && typeof self.offensivePointsScored !== 'undefined' &&
        self.offensivePointsScoredOn !== null && typeof self.offensivePointsScoredOn !== 'undefined') {

      self.offensivePlusMinus = self.offensivePointsScored - self.offensivePointsScoredOn;
    }
    
    if (self.defensivePointsScored !== null && typeof self.defensivePointsScored !== 'undefined' &&
        self.defensivePointsScoredOn !== null && typeof self.defensivePointsScoredOn !== 'undefined') {

      self.defensivePlusMinus = self.defensivePointsScored - self.defensivePointsScoredOn;
    }
    
    if (self.defensivePlusMinus !== null && typeof self.defensivePlusMinus !== 'undefined' &&
        self.offensivePlusMinus !== null && typeof self.offensivePlusMinus !== 'undefined') {

      self.plusMinus = self.defensivePlusMinus + self.offensivePlusMinus;
    }

    if (self.offensivePossessionsPlayed !== null && typeof self.offensivePossessionsPlayed !== 'undefined' &&
        self.offensivePointsScoredOn !== null && typeof self.offensivePointsScoredOn !== 'undefined' &&
        self.defensivePointsScoredOn !== null && typeof self.defensivePointsScoredOn !== 'undefined') {

      self.defensivePossessionsPlayed = self.offensivePossessionsPlayed - self.offensivePointsPlayed + self.offensivePointsScoredOn + self.defensivePointsScoredOn;
    }

    self.touches = self.throws + self.stalls + self.goals;
    if (self.offensivePossessionsPlayed !== null && typeof self.offensivePossessionsPlayed !== 'undefined' && self.offensivePossessionsPlayed !== 0) {
      var perOffensivePossessionAttrs = [
        'goals',
        'assists',
        'hockeyAssists',
        'throws',
        'completions',
        'throwaways',
        'throwsIntoBlocks',
        'catches',
        'drops',
        'travels',
        'stalls',
        'touches'
      ];

      perOffensivePossessionAttrs.forEach(function(attr, index, array) {
        self[attr + 'PerPoss'] = self[attr] / self.offensivePossessionsPlayed;
      });
    }

    if (self.defensivePossessionsPlayed !== null && typeof self.defensivePossessionsPlayed !== 'undefined' && self.defensivePossessionsPlayed !== 0) {
      var perDefensivePossessionAttrs = [
        'blocks',
        'callahans',
        'bookends'
        // fouls?
      ];

      perDefensivePossessionAttrs.forEach(function(attr, index, array) {
        self[attr + 'PerPoss'] = self[attr] / self.defensivePossessionsPlayed;
      });
    }
  },
  scopedPerformances: function(self, cb) {
    var query = 'SELECT * FROM performances ' +
                'LEFT JOIN games ON performances.game = games.id ' +
                'LEFT JOIN weeks ON games.week = weeks.id ';
    
    if(self.player !== null && self.team === null) {
      // This is a Statistic for a player
      query += ' WHERE performances.player = ' + self.player;
    } else if(self.team !== null && self.player === null) {
      // This is a Statistic for a team
      query += ' WHERE performances.team = ' + self.team;
    }
    
    if(self.season !== null && self.week === null) {
      // This is a Statistic for a season
      query += ' AND weeks.season = ' + self.season;
    } else if(self.week !== null && self.season === null) {
      // This is a Statistic for a week
      if (self.player !== null && self.team === null) {
        cb(new Error('Tried to make a Statistic that should be a Performance'));
      }
      query += ' AND weeks.id = ' + self.week;
    }
    
    Performances.query(query, cb);
  },
  refreshStatistics: function(self, cb) {
    Statistics.scopedPerformances(self, function refreshFromPerformances(err, scopedPerformanceRecords) {
      if (err) {
        cb(err);
      }
      
      var sumAttrs = [
        'goals',
        'assists',
        'hockeyAssists',
        'blocks',
        'bookends',
        'throws',
        'completions',
        'throwaways',
        'throwsIntoBlocks',
        'catches',
        'callahans',
        'drops',
        'fouls',
        'travels',
        'stalls'
      ];
      
      sumAttrs.forEach(function(attr, index, array) {
        self[attr] = 0;
        
        scopedPerformanceRecords.forEach(function(performance, pIndex, pArray) {
          self[attr] += performance[attr];
        });
      });
      
      var sevenBasedAttrs = [
        'offensivePossessionsPlayed',
        'offensivePointsPlayed',
        'defensivePointsPlayed',
        'offensivePointsScored',
        'offensivePointsScoredOn',
        'defensivePointsScored',
        'defensivePointsScoredOn'
      ];
      
      if (self.player !== null && self.team === null) {
        sevenBasedAttrs.forEach(function(attr, index, array) {
          self[attr] = 0;
          
          scopedPerformanceRecords.forEach(function(performance, pIndex, pArray) {
            self[attr] += performance[attr];
          });
        });
      } else if (self.team !== null && self.player === null) {
        sevenBasedAttrs.forEach(function(attr, index, array) {
          self[attr] = 0;
          
          scopedPerformanceRecords.forEach(function(performance, pIndex, pArray) {
            self[attr] += performance[attr];
          });
          
          self[attr] /= 7;
          self[attr] = Math.round(self[attr]);
        });
      }
      
      Statistics.refreshDerivativeStatistics(self);

      cb();
    });
  },
  updatePercentiles: function(cb) {
    Statistics.find().exec(function(err, stats) {
      Seasons.find().populate('weeks').exec(function(err, seasons) {
        seasons.forEach(function(season, index, array) {
          percentileStats(stats.filter(function(elem) { return elem.season === season.id; }));

          season.weeks.forEach(function(week, weekIndex, weekArray) {
            percentileStats(stats.filter(function(elem) { return elem.week === week.id; }));
          });
        });

        var numberDone = 0;

        stats.forEach(function(stat, statIndex, statArray) {
          stat.save(function(err) {
            if (err) {
              cb(err);
            } else {
              numberDone++;
              if (numberDone === statArray.length) {
                cb();
              }
            }
          });
        });
      });
    });

    function percentileStats(stats) {
      if (stats === null || typeof stats === 'undefined') {
        return;
      }
      // Attr name mapped to whether they are a bad thing
      // (meaning less is better)
      var percentileAttrs = {
        goalsPerPoss: false,
        assistsPerPoss: false,
        hockeyAssistsPerPoss: false,
        throwsPerPoss: false,
        completionsPerPoss: false,
        throwawaysPerPoss: true,
        throwsIntoBlocksPerPoss: true,
        catchesPerPoss: false,
        dropsPerPoss: true,
        travelsPerPoss: true,
        stallsPerPoss: true,
        touchesPerPoss: false,
        blocksPerPoss: false,
        callahansPerPoss: false,
        bookendsPerPoss: false
      };

      Object.keys(percentileAttrs).forEach(function(attr, index, array) {
        var compareOnAttr = function(a, b) {
          if (a[attr] < b[attr]) {
            if (percentileAttrs[attr]) {
              return 1;
            } else {
              return -1;
            }
          } else if (a[attr] > b[attr]) {
            if (percentileAttrs[attr]) {
              return -1;
            } else {
              return 1;
            }
          } else {
            return 0;
          }
        };

        stats.sort(compareOnAttr);
        stats.forEach(function(stat, statIndex, statArray) {
          stat[attr + 'Percentile'] = Math.round((statIndex / statArray.length) * 100);
        });
      });
    }
  },
  // Lifecycle callbacks
  beforeCreate: function(self, cb) {
    Statistics.refreshStatistics(self, cb);
  }
};

