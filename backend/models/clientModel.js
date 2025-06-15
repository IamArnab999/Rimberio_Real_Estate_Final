import pool from "../config/mysqlConfig.js";

export const getClients = async () => {
  const [rows] = await pool.query("SELECT * FROM clients");
  return rows;
};

export const addClient = async (client) => {
  const { name, email, phone, status, type, last_activity } = client;
  const [result] = await pool.query(
    "INSERT INTO clients (name, email, phone, status, type, last_activity) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, phone, status, type, last_activity]
  );
  return result.insertId;
};
