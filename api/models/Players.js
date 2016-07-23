/**
 * Player.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Promise = require('bluebird');

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    team: {
      model: 'teams',
      required: true
    },

    performances: {
      collection: 'performances',
      via: 'player'
    },

    mluApiId: {
      type: 'string',
      unique: true,
      required: true
    }
  },
  statistics: function(id) {
    var statsPromise = Statistics.find({player: id, team: null});
    var performancesPromise = Performances.find({player: id});

    return Promise.all([statsPromise, performancesPromise])
      .spread(function(stats, performances) {
        var career = stats.filter(function(statObj) {
          return statObj.week === null && statObj.season === null;
        });

        if (career.length > 1) {
          sails.log.warn('Multiple career statistics for same player.');
        }
        career = career[0];

        var seasons = stats.filter(function(statObj) {
          return statObj.season !== null && statObj.week === null;
        });

        return {
          career: career,
          seasons: seasons,
          weeks: performances
        };
      });
  }
};
