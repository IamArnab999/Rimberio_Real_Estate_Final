// import { getUsers, addUser } from "../models/mysqlModel.js";

// export const fetchAllUsers = async () => {
//   return await getUsers();
// };

// export const createNewUser = async (user) => {
//   return await addUser(user);
// };

import { getClients, addClient } from "../models/mysqlModel.js"; // Use addClient instead of addUser
import { getUsers, addUser } from "../models/mysqlModel.js";

export const fetchAllClients = async () => {
  return await getClients();
};



export const createNewClient = async (client) => {
  return await addClient(client);
};

// Fetch a user by ID or email
// Fetch all users
export const fetchAllUsers = async () => {
  return await getUsers();
};

// Create a new user
export const createNewUser = async (user) => {
  return await addUser(user);
};