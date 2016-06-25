describe('ScraperService', function() {
  describe('#scrapeCurrentWeek', function() {
    it ('should return valid data', function(done) {
      // This is a very long-running test as it involves a ton of database IO
      this.timeout(40000);
        
      ScraperService.scrapeCurrentWeek(function() {
        Players.find().populate('team').populate('performances').exec(function(err, players) {
          players.forEach(function(player, index, array) {
            if (player.name !== 'Fake Name') {
              player.team.should.not.equal(null);
              player.performances.length.should.equal(1);
            }
          });
          done();
        });
      });
    });
  });
});
