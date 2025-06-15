import { addVisit, addNotification } from "../models/mysqlModel.js";
import { getAllVisitsWithUser } from "../models/visitModel.js";
import { v4 as uuidv4 } from "uuid";

// Visit Controller Placeholder

export const placeholderVisitController = () => {};

// Add a new visit and create a notification
export const addVisitWithNotification = async (req, res) => {
  try {
    // Only pass the correct fields to addVisit
    const {
      property_id,
      property_name,
      propertyImage,
      imageUrl,
      mapUrl,
      location,
      price,
      beds,
      baths,
      sqft,
      date,
      time,
      firebase_uid,
      user_name,
      user_email,
      status,
      lat,
      lng
    } = req.body;
    const visitData = {
      property_id,
      property_name,
      propertyImage,
      imageUrl,
      mapUrl,
      location,
      price,
      beds,
      baths,
      sqft,
      date,
      time,
      firebase_uid,
      user_name,
      user_email,
      status,
      lat,
      lng
    };
    const visitId = await addVisit(visitData);
    // Create notification for the visit event
    const { firebase_uid: uid, property_name: pname, date: vdate, time: vtime } = req.body;
    if (uid && pname && vdate) {
      // Use the same notification_id format as frontend
      const notification_id = `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const message = `Scheduled a visit for ${pname}`;
      const created_at = new Date();
      const notification = {
        notification_id,
        firebase_uid: uid,
        message,
        status: "Unread",
        created_at,
        date: vdate,
        time: vtime,
      };
      await addNotification(notification);
    }
    res.json({ success: true, id: visitId });
  } catch (err) {
    console.error("Error in addVisitWithNotification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all visits for admin calendar
export const getAllVisitsForCalendar = async (req, res) => {
  try {
    const visits = await getAllVisitsWithUser();
    res.json(visits);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
