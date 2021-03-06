/**
 * Performance.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    player: {
      model: 'players',
      required: true
    },
    game: {
      model: 'games',
      required: true
    },
    team: {
      model: 'teams',
      required: true
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
    }
  }
};

