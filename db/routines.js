const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function getRoutineById(id) {
  try {
    const {rows: [routine],
    } = await client.query(
    `
    SELECT * FROM routines 
    WHERE id=$1;`, [id]);
    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  const { rows: routines } = await client.query(`
  SELECT * FROM routines`);
  return routines;
}
 
async function getAllRoutines() {
  const { rows } = await client.query(`
  SELECT routines.*, users.username AS "creatorName" 
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  ;`);
  return attachActivitiesToRoutines(rows);
} 

async function getAllPublicRoutines() {
  try{
    const {rows} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE routines."isPublic" = true;
    `);
    return attachActivitiesToRoutines(rows); 
  } catch(error) {
      console.error(error);
      throw error
    } 
}

async function getAllRoutinesByUser({ username }) {
  try{
    const {rows:routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE username = $1
    `, [username]);
    return attachActivitiesToRoutines(routines);
    } catch(error) {
        console.error(error);
        throw error
      } 
}

async function getPublicRoutinesByUser({ username }) {
  try{
    const {rows:routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE username = $1 AND routines."isPublic" = true;
    `, [username]);
    return attachActivitiesToRoutines(routines);
    } catch(error) {
        console.error(error);
        throw error
      } 
  }

async function getPublicRoutinesByActivity({ id }) {
  try{
    const {rows:routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routine_activities."activityId" = ${id} AND routines."isPublic" = true;
    `,);
    return attachActivitiesToRoutines(routines);
    } catch(error) {
      console.error(error);
      throw error
      } 
 }

async function createRoutine({ creatorId, isPublic, name, goal }) {
  const {rows: [routine],} = await client.query(
  `
  INSERT INTO routines ("creatorId", "isPublic", name, goal)
  VALUES($1, $2, $3, $4)
  RETURNING *;`,
  [creatorId, isPublic, name, goal]
  );
    return routine;
  }
  
async function updateRoutine({ id, ...fields }) {
  const setValue = Object.keys(fields)
  .map((key, index) => `"${key}"=$${index + 1}`)
  .join(", ");
    try{ 
      const{rows:[routine]} =
      await client.query(
      `
      UPDATE routines
      SET ${setValue}
      WHERE id=${id}
      RETURNING *;
       `,
      Object.values(fields)
      );
      return routine
    } catch (error) {
      console.error(error);
      throw error;
      }
}
    
async function destroyRoutine(id) {
  await client.query(
  ` 
  DELETE 
  FROM  routine_activities 
  WHERE "routineId" =$1;
  `,[id]);
  const {rows: [routine], } = await client.query(
  ` DELETE 
  FROM  routines 
  WHERE id =$1;
  `,[id]
  );
    return routine;
  } 
      
module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
