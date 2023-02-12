const express = require('express');
const router = express.Router();
const {getAllActivities, getActivityById,getPublicRoutinesByActivity,  getActivityByName, createActivity,  
  updateActivity} = require("../db");
const { requireUser } = require("./utils");

const{ActivityNotFoundError, ActivityExistsError, } = require ("../errors")

router.get("/:activityId/routines", async (req, res, next) => {
  const { activityId } = req.params;
  try {
    const activity = await getActivityById(activityId);
    if (!activity) {
      return next({
        name: ActivityNotFoundError(activityId),
        message: `Activity ${activityId} not found`,
        error: ActivityNotFoundError(activityId),
      });
    }
    const publicRoutines = await getPublicRoutinesByActivity(activity);
    res.send(publicRoutines);
  } catch (error) {
    next(error);
  }
});

// GET /api/activities

router.get("/", async (req, res, next) => {
  try {
      const activities = await getAllActivities();
      res.send(activities);
  } catch (error) {
      next({
          name: "Error",
          message: error.message,
          error: error,
      });
   }
});

// POST /api/activities

router.post("/", requireUser, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newActivity = {};
    const existingActivity = await getActivityByName(name);
    if (existingActivity) {
      next({
        name: ActivityExistsError(name),
        message: `An activity with name ${name} already exists`,
        error: ActivityExistsError(name),
      });
    } else {
      newActivity.name = name;
      newActivity.description = description;
      const result = await createActivity(newActivity);
      res.send(result);
    }
  } catch (error) {
    next(error);
  }
});

// PATCH /api/activities/:activityId

router.patch("/:activityId", requireUser, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const id = req.params.activityId;
    const activity = await getActivityById(id);

    if (!activity) {
      return next({
        error: ActivityNotFoundError(id),
        name: ActivityNotFoundError(id),
        message: `Activity ${id} not found`,
      });
    }

    const activityWithSameName = await getActivityByName(name);
    if (activityWithSameName && activityWithSameName.id !== id) {
      return next({
        error: ActivityExistsError(name),
        name: ActivityExistsError(name),
        message: `An activity with name ${name} already exists`,
      });
    }

    const updatedActivity = await updateActivity({ id, name, description });
    res.send(updatedActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
