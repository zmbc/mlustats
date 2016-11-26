/* PlayerController test */

describe('PlayersController', function () {
  describe('#view', function() {
    it('should respond ok with valid player id', function(done) {
      request(sails.hooks.http.app)
        .get('/player/1')
        .expect(200)
        .end(done);
    });
    
    it("should 404 if player doesn't exist", function(done) {
      request(sails.hooks.http.app)
        .get('/player/1000000')
        .expect(404)
        .end(done);
    });
  });
});
