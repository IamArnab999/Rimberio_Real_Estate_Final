// backend/models/propertyModel.js
import db from '../config/mysqlConfig.js';

export const getAllProperties = async () => {
  try {
    const [results] = await db.query('SELECT * FROM properties');
    return results;
  } catch (err) {
    throw err;
  }
};

export const addProperty = async (property) => {
  const { firebase_uid, name, email, role, title, address, price, status, mapUrl, imageUrl, beds, baths, sqft } = property;
  try {
    const [result] = await db.query(
      'INSERT INTO properties (firebase_uid, name, email, role, title, address, price, status, mapUrl, imageUrl, beds, baths, sqft) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [firebase_uid, name, email, role, title, address, price, status, mapUrl, imageUrl, beds, baths, sqft]
    );
    return { ...property, id: result.insertId };
  } catch (err) {
    throw err;
  }
};

export const deleteProperty = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
    return result;
  } catch (err) {
    throw err;
  }
};

export const updateProperty = async (id, updates) => {
  // Only update allowed fields
  const { title, price, status, beds, baths, sqft, imageUrl, mapUrl } = updates;
  try {
    const [result] = await db.query(
      'UPDATE properties SET title = ?, price = ?, status = ?, beds = ?, baths = ?, sqft = ?, imageUrl = ?, mapUrl = ? WHERE id = ?',
      [title, price, status, beds, baths, sqft, imageUrl, mapUrl, id]
    );
    return result;
  } catch (err) {
    throw err;
  }
};
