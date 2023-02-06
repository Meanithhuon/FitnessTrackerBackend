/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const { requireUser, authenticateToken } = require("./utils");

const jwt = require("jsonwebtoken");

const {
    getUserByUsername, createUser, getUser, getPublicRoutinesByUser,getAllRoutinesByUser,

} = require("../db");

// POST /api/users/register

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      throw new Error(`User ${username} already exists.`);
    }

    if (password.length < 8) {
      next({
        message: "Password Too Short!",
        name: `PasswordFormatError`,
        error: 'Error'
      });
    }

    const user = await createUser({
      username,
      password,
    });

    const token = jwt.sign(user, process.env.JWT_SECRET);

    res.send({
      message: "Thank you for registering.",
      token,
      user: user,
    });
  } catch (error) {
    next({
      name: error.name,
      message: error.message,
      error: "Error",
    });
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return next({
        name: "MissingUsernameOrPasswordError",
        message: "You must enter a username and password",
      });
    }
  
    try {
      const user = await getUser({ username, password });
      if (!user) {
        return next({
          name: "IncorrectUsernameOrPasswordError",
          message: "Username or password is incorrect",
        });
      }
  
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
      res.send({ message: "you're logged in!", token, user });
      
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  


// GET /api/users/me





router.get("/me", authenticateToken, requireUser, async (req, res, next) => {
  try {
    console.log(req.user);
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(401).send({
        error: "Unauthorized",
        name: "UnauthorizedError",
        message: "You must be logged in to perform this action",
      });
    }
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

router.get("/:username/routines", async (req, res, next) => {
 
  try{
    const {username} = req.params;
    const user = await getUserByUsername(username);
    if (!user){
      next({
        name: "NoUserError",
        message: "User does not exist."
      });
    }
    if(req.user && user.id == req.user.id ){
      const routines = await getAllRoutinesByUser({username: username});
      res.send(routines)
    }
    const routines = await getPublicRoutinesByUser({username: username});
    res.send(routines)
  } catch(error){
    next(error)
  }

})




module.exports = router;
