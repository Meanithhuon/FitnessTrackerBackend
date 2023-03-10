const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

router.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

router.use((req, res, next) => {
  if (req.user) {
    console.log('User is set:', req.user);
  }
  next();
});

// GET /api/health

router.get('/health', async (req, res, next) => {
    try {
      res.send({
        message: "I am healthy"
      });
    } catch (error) {
      next(error);  
    }
  });

// ROUTER: /api/users
const usersRouter = require('./users');
router.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
router.use('/routine_activities', routineActivitiesRouter);

router.use('*', (req, res, next) => {
  res.status(404)
  res.send({
    message: "The requested resource could not be found."
  })
})

router.use((error, req, res, next) => {
if (error.name == 'Unauthorized'){
  res.status(401)
}
  res.send({
    error: error.name,
    name: error.name,
    message: error.message
  });
});

router.use((error, req, res, next) => {
  if (error.code === 409) {
    res.status(409).send({
      error: "Conflict",
      message: error.message
    });
  } else {
    next(error);
  }
});

router.use((err, req, res) => {
  const error = {
    name: err.name,
    message: err.message,
    error: err
  };
  res.status(500).send(error);
});

router.use((error, req, res, next) => {
  res.send(error);
});
 
module.exports = router;


