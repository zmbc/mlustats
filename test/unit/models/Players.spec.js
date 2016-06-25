describe('Players', function() {
  it ('should not be empty', function(done) {
    Players.find().exec(function(err, players) {
      players.length.should.be.eql(fixtures.players.length);

      done();
    });
  });
});
