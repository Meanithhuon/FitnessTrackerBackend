const express = require('express');
const router = express.Router();

const {
    getRoutineById,
    updateRoutineActivity,
    getRoutineActivityById,
    destroyRoutineActivity,
  } = require("../db");

  const { requireUser } = require("./utils");

  const{UnauthorizedUpdateError,  UnauthorizedDeleteError } = require ("../errors")

// PATCH /api/routine_activities/:routineActivityId

  router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
    try {
      const { count, duration } = req.body;
      const routineActivityId = req.params.routineActivityId;
  
      // Get the routine activity by its id
      const routineactivity = await getRoutineActivityById(routineActivityId);
  
      // Get the routine by its id
      const routine = await getRoutineById(routineactivity.routineId);
  
      // Check if the user making the request is the creator of the routine
      if (routine.creatorId != req.user.id) {
        res.status(403);
        next({
          error: UnauthorizedUpdateError(req.user.username, routine.name),
          name:  UnauthorizedUpdateError(req.user.username, routine.name),
          message: `User ${req.user.username} is not allowed to update ${routine.name}`,
        });
      } else {
        // Update the routine activity
        const newRoutineActivity = await updateRoutineActivity({
          id: routineActivityId,
          count,
          duration,
        });
  
        // Send the updated routine activity to the client
        res.send(newRoutineActivity);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
  
  
// DELETE /api/routine_activities/:routineActivityId

router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
    try {
      const routineActivityId = req.params.routineActivityId;
      const routineActivity = await getRoutineActivityById(routineActivityId);
  
      const routine = await getRoutineById(routineActivity.routineId);
  
      if (routine.creatorId != req.user.id) {
        res.status(403);
        next({
          name:  UnauthorizedDeleteError(req.user.username,routine.name ),
          message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
          error: UnauthorizedDeleteError(req.user.username,routine.name ),
        });
      }
      await destroyRoutineActivity(routineActivityId);
      res.send(routineActivity);
    } catch ({ name, message, error}) {
      next({ name, message, error });
    }
  });
  

module.exports = router;
