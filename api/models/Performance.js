/**
 * Performance.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
	player: {
		model: 'player'
	},
	game: {
		model: 'game'
	},
	team: {
		model: 'team'
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
	throws: {
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
	turnovers: {
		type: 'integer'
	},
	offensivePointsPlayed: {
		type: 'integer'
	},
	defensivePointsPlayed: {
		type: 'integer'
	}
  }
};

