const client = require("./client");

async function addActivityToRoutine({routineId,activityId,count,duration,}) {
  try{
  const {rows:[routine]} = await client.query(`
  INSERT INTO routine_activities(
  "routineId",
  "activityId",
  count,
  duration)
  VALUES ($1,$2,$3,$4)
  RETURNING *`
  ,[ routineId,activityId, count,duration]
  );
  return routine;
  }catch(error) {
    console.error(error);
    throw error
  }

}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(`SELECT * FROM routine_activities WHERE id=$1;`, [
      id,
    ]);
    return routine_activity;
  } catch (error) {
    console.error(error);
    throw error
  }
  }




  async function updateRoutineActivity({ id, ...fields }) {
    const setValue = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
    if (setValue.length === 0) {
      return;
    }
   try{ 
  const{rows:[routine_activities]} =
      await client.query(
        `
        UPDATE routine_activities
        SET ${setValue}
        WHERE id=${id}
        RETURNING *;
      `,
        Object.values(fields)
      );
      return routine_activities
     } catch (error) {
      console.error(error);
         throw error;
   }
  }


  async function destroyRoutineActivity(id) {
    try {
      const {
        rows: [routine_activity],
      } = await client.query(
        ` DELETE 
       FROM routine_activities 
       WHERE id =$1
       RETURNING *
       ;`,
        [id]
      );
      return routine_activity;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function getRoutineActivitiesByRoutine({ id }) {
    try {
      const { rows } = await client.query(`
        SELECT *
        FROM routine_activities
        WHERE "routineId"= ${id}
      `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function canEditRoutineActivity(routineActivityId, userId) {
    try {
      const {
        rows: [routine_activity],
      } = await client.query(
        ` SELECT * 
       FROM routine_activities 
       JOIN routines ON routine_activities."routineId" = routines.id
       AND routine_activities.id =$1
       
       ;`,
        [routineActivityId]
      );
      return routine_activity.creatorId === userId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
