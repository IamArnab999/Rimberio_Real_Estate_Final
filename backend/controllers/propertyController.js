// backend/controllers/propertyController.js
import { getAllProperties, addProperty, deleteProperty, updateProperty } from '../models/propertyModel.js';
import { uploadToAzure } from '../utils/AzureStorage.js';

export const getProperties = async (req, res) => {
  try {
    const properties = await getAllProperties();
    console.log("Fetched properties from DB:", properties); // Log fetched properties
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    console.log("Property POST body:", req.body); // Log incoming data
    const {
      firebase_uid,
      name,
      email,
      role,
      title,
      address,
      price,
      status,
      mapUrl,
      imageUrl,
      beds,
      baths,
      sqft
    } = req.body;
    const property = {
      firebase_uid,
      name,
      email,
      role,
      title,
      address,
      price,
      status,
      mapUrl,
      imageUrl,
      beds,
      baths,
      sqft
    };
    const newProperty = await addProperty(property);
    res.status(201).json(newProperty);
  } catch (err) {
    console.error("Property insert error:", err); // Log error details
    res.status(500).json({ error: err.message });
  }
};

export const uploadPropertyImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Use originalname for file name, and buffer for file data
    const result = await uploadToAzure(req.file.buffer, req.file.originalname, process.env.AZURE_STORAGE_CONTAINER_NAME || 'projects');
    if (result.success) {
      res.json({ imageUrl: result.url });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeProperty = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProperty(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePropertyController = async (req, res) => {
  try {
    const id = req.params.id;
    // Only allow updating editable fields from the frontend
    const { title, price, status, beds, baths, sqft, imageUrl, mapUrl } = req.body;
    const updates = { title, price, status, beds, baths, sqft, imageUrl, mapUrl };
    await updateProperty(id, updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
