import { getClients, addClient } from "../models/mysqlModel.js";
import pool from "../config/mysqlConfig.js";

// Controller to get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await getClients();
    console.log("Fetched clients:", clients); // Debug log
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).send("Failed to fetch clients");
  }
};

// Controller to add a new client
export const createClient = async (req, res) => {
  const { name, email, phone, status, type, last_activity } = req.body;
  if (!name || !email || !phone || !status || !type || !last_activity) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const clientId = await addClient({ name, email, phone, status, type, last_activity });
    res.status(201).json({ id: clientId, name, email, phone, status, type, last_activity });
  } catch (err) {
    console.error("Error adding client:", err);
    res.status(500).send("Failed to add client");
  }
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM clients WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ message: "Failed to delete client" });
  }
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status, type, last_activity } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE clients SET name = ?, email = ?, phone = ?, status = ?, type = ?, last_activity = ? WHERE id = ?",
      [name, email, phone, status, type, last_activity, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client updated successfully" });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ message: "Failed to update client" });
  }
};
