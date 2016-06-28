describe('NgAdminController', function() {
  describe('#index', function() {
    it('should return 404 if no user/pass', function(done) {
      request(sails.hooks.http.app)
        .get('/admin')
        .expect(404)
        .end(done);
    });
    
    it('should return 404 if incorrect user/pass', function(done) {
      request(sails.hooks.http.app)
        .get('/admin?user=blah&pass=blahblah')
        .expect(404)
        .end(done);
    });
    
    it('should return 200 if correct user/pass', function(done) {
      request(sails.hooks.http.app)
        .get('/admin?user=' + process.env.MLUSTATS_USERNAME + '&pass=' + process.env.MLUSTATS_PASSWORD)
        .expect(200)
        .end(done);
    });
  });
});
