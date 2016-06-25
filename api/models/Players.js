/**
 * Player.js
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
  }
};

