const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log('token:', token);


  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    
    if (err) return res.sendStatus(403);
    req.user = user;
    
    next();
  });
}




function requireUser(req, res, next) {
  console.log(req.user);
    if (!req.user) {
      res.status(401);
      return next({
        name: "NotAuthorizedError",
        message: "You must be logged in to perform this action",
      });
    }
    next();
  }
  
 

   
  


  module.exports = {
    requireUser, authenticateToken,
  };

