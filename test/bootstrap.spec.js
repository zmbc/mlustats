var sails = require('sails'),
  Barrels = require('barrels');
global.sinon = require('sinon');
global.should = require('should');
global.request = require('supertest');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(20000);

  sails.lift({
      log: {
      level: 'error'
    },
      models: {
      connection: 'test',
      migrate: 'drop'
    }
  }, function(err, server) {
    if (err) return done(err);
    
    var barrels = new Barrels();

    // Save original objects in `fixtures` variable
    global.fixtures = barrels.data;

    // Populate the DB
    barrels.populate(['teams', 'players'], function(err) {
      done(err, sails);
    });
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});
