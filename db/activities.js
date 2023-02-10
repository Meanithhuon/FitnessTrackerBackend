

const client = require('./client');

// database functions

  // return the new activity
 
async function createActivity({ name, description }) {
  try{

    const {
      rows
    } = await client.query(
      `
      INSERT INTO activities(name, description) 
      VALUES($1, $2)
      RETURNING *;
    `,
      [name, description]
    );
    return rows[0];
  }catch(error) {
    console.error(error);
    throw { message: error.message, name: error.name, error };
  }
}


 // select and return an array of all activities

async function getAllActivities() {
  try{
    const { rows } = await client.query(`
      SELECT *
      FROM activities;
    `);
    return rows;}
    catch(error) {
      console.error(error);
      throw error
    }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(`SELECT * FROM activities WHERE id=$1;`, [id]);
    return activity;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getActivityByName(name) {
  try{
  const {rows:[activity]} = await client.query(`
  SELECT *
  FROM activities
  WHERE name=$1;
`,[name]);
return activity;
  }catch(error){
    console.error(error);
    throw error
  }
}


  // select and return an array of all activities

async function attachActivitiesToRoutines(routines) {

  const routinesWithActivities = [...routines];
  
  const routineIds = routines.map(routine => routine.id);
  const binds = routines.map((routine, index) => `$${index + 1}`).join(', ');
  if (!routineIds?.length) return [];
  console.log(binds)
  try {
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, 
      routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${ binds });
    `, routineIds);

   
    for (let i = 0; i < routinesWithActivities.length; i++) {
      const routine = routinesWithActivities[i];
      const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
      routine.activities = activitiesToAdd;
    }
    return routinesWithActivities;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

  // don't try to update the id
  // do update the name and description
  // return the updated activity

  async function updateActivity({ id, ...fields }) {
    const setValues = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");
    if (setValues.length === 0) {
      return;
    }
  
    const {
      rows: [activity],
    } = await client.query(
      `
        UPDATE activities
        SET ${setValues}
        WHERE id=${id}
        RETURNING *;
      `,
      Object.values(fields)
    );
  
    return activity;
  }


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
