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
    type: 'integer',
    required: true
  },
  assists: {
    type: 'integer',
    required: true
  },
  hockeyAssists: {
    type: 'integer',
    required: true
  },
  blocks: {
    type: 'integer',
    required: true
  },
  throws: {
    type: 'integer',
    required: true
  },
  throwaways: {
    type: 'integer',
    required: true
  },
  throwsIntoBlocks: {
    type: 'integer',
    required: true
  },
  catches: {
    type: 'integer',
    required: true
  },
  callahans: {
    type: 'integer',
    required: true
  },
  drops: {
    type: 'integer',
    required: true
  },
  fouls: {
    type: 'integer',
    required: true
  },
  travels: {
    type: 'integer',
    required: true
  },
  stalls: {
    type: 'integer',
    required: true
  },
  offensivePossessions: {
    type: 'integer',
    required: true
  },
  offensivePointsPlayed: {
    type: 'integer',
    required: true
  },
  defensivePointsPlayed: {
    type: 'integer',
    required: true
  }
  }
};

