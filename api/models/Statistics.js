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
    offensivePossessions: {
      type: 'integer'
    },
    offensivePointsPlayed: {
      type: 'integer'
    },
    defensivePointsPlayed: {
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
        'offensivePossessions',
        'offensivePointsPlayed',
        'defensivePointsPlayed'
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
      
      cb();
    });
  },
  // Lifecycle callbacks
  beforeCreate: function(self, cb) {
    Statistics.refreshStatistics(self, cb);
  }
};

