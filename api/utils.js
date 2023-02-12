
// const{UnauthorizedError} = require ("../errors")
  
 
function requireUser(req, res, next) {
  console.log(req.user);
    if (!req.user) {
      res.status(401);
      return next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action",
      });
    }
    next();
  }
  
 
  module.exports = {
    requireUser, 
  };
