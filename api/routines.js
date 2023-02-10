const express = require('express');
const router = express.Router();

const {
  getAllRoutines,createRoutine, getRoutineById, updateRoutine, destroyRoutine,
  addActivityToRoutine, getRoutineActivitiesByRoutine
} = require("../db");

const { requireUser,} = require("./utils");
const{ UnauthorizedDeleteError, UnauthorizedUpdateError,} = require ("../errors")

// GET /api/routines

router.get("/", async (req, res, next) => {
    try {
      const routines = await getAllRoutines();
      res.send(routines);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", requireUser, async (req, res, next) => {
    const { name, goal, isPublic } = req.body;
  
    try {
      const newRoutine = await createRoutine({
        creatorId: req.user.id,
        name,
        goal,
        isPublic,
      });
      if (newRoutine) {
        console.log(newRoutine);
        res.send(newRoutine);
      } else {
        next({
          name: "UserNotLoggedInError",
          message: "You must be logged in to perform this action.",
          error: "UserNotLoggedInError",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  

  


// PATCH /api/routines/:routineId

router.patch("/:routineId", requireUser, async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401);
        next({ name: "UserNotLoggedIn.", message: "User is not logged in.", error: "UserNotLoggedIn."});
        return;
      }
  
      const id = req.params.routineId;
      const name = req.body.name;
      const goal = req.body.goal;
      const isPublic = req.body.isPublic;
     
      const routine = await getRoutineById(id);
      if (routine.creatorId !== req.user.id) {
        res.status(403);
        next({
          name: UnauthorizedUpdateError (req.user.username, routine.name),
          message:  `User ${req.user.username} is not allowed to update ${routine.name}`,
          error: UnauthorizedUpdateError (req.user.username, routine.name),
        });
      }
  
      let updatedRoutine = { id, isPublic, name, goal };
      if (!name) {
        updatedRoutine.name = routine.name;
      }
      if (!goal) {
        updatedRoutine.goal = routine.goal;
      }
      if (isPublic === undefined) {
        updatedRoutine.isPublic = routine.isPublic;
      }
  
      const result = await updateRoutine(updatedRoutine);
      res.send(result);
    } catch (error) {
      next(error);
    }
  });








// DELETE /api/routines/:routineId

router.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const id = req.params.routineId;
   

    const routine = await getRoutineById(id);
    if (routine.creatorId !== req.user.id) {
      res.status(403);
      next({
        name: UnauthorizedDeleteError (req.user.username, routine.name),
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
  
    }

    await destroyRoutine(id);
    res.send(routine);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

router.post("/:routineId/activities", requireUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;
    console.log(req.body, "potato");
    const routine_activities = await getRoutineActivitiesByRoutine({
      id: routineId,
    });
    let alreadyFound = false;
    routine_activities.forEach((r_a) => {
      if (r_a.activityId == activityId) {
        alreadyFound = true;
      }
    });
    if (alreadyFound) {
      next({
        name: "duplicate activityId",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      });
    } else {
      const newRoutine = await addActivityToRoutine({
        routineId,
        activityId,
        duration,
        count,
      });
      res.send(newRoutine);
    }
  } catch (error) {
    next(error);
  }
});


module.exports = router;
