module.exports = function isAdmin (req, res, next) {    
  if (req.query.user &&
      req.query.pass &&
      process.env.MLUSTATS_USERNAME &&
      process.env.MLUSTATS_PASSWORD &&
      req.query.user === process.env.MLUSTATS_USERNAME &&
      req.query.pass === process.env.MLUSTATS_PASSWORD) {
    
    return next();
  }
  
  return res.notFound();
};
