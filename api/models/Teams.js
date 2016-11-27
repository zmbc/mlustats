/**
 * Team.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    
    city: {
      type: 'string',
      required: true
    },
    
    color: {
      type: 'string'
    },
    
    players: {
      collection: 'players',
      via: 'team'
    },
    
    performances: {
      collection: 'performances',
      via: 'team'
    },

    mluApiId: {
      type: 'integer',
      unique: true
    }
  }
};

