/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    homeTeam: {
      model: 'teams',
      required: true
    },
    
    awayTeam: {
      model: 'teams',
      required: true
    },
    
    season: {
      type: 'integer',
      required: true
    },

    week: {
      type: 'integer',
      required: true
    },
    
    mluApiId: {
      type: 'integer',
      unique: true
    }
  }
};

