const client = require("./client");
const bcrypt = require("bcrypt");

// database functions

async function createUser({ username, password }) {
  const SALT_COUNT = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
  let userToAdd = {username, hashedPassword};
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username;
    `,
      [userToAdd.username, userToAdd.hashedPassword]
    );
    return user;
  } catch (error) {
    if (error.message.toLowerCase().includes("unique") || error.message.toLowerCase().includes("constraint") 
      || error.message.toLowerCase().includes("failed")) {
      throw new Error("Username already exists");
    }
    console.error(error);
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    let passwordsMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordsMatch) {
      delete user.password;
      return user;
    } 
    else if(!passwordsMatch) {
      return ;
    }
    else {
      throw Error("Error");
    }
  } catch (error) {
    console.error(error);
  }
}

async function getUserById(userId) {
  try{
   const {rows:[user] } = await client.query(
   `
   SELECT id, username
   FROM users
   WHERE id=$1
   `,[userId]);
   return user;
  } catch(error){
   console.error(error);
   throw error;
   }
 }
 
 async function getUserByUsername(username) {
  try{
    const {rows: [user],} = await client.query(
    `
    SELECT *
    FROM users
    WHERE username=$1;
    `,
      [username]
    );
    return user;
    } catch(error){
      console.error(error);
      throw error;
      }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
