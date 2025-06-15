import express from "express";
import { addVisitWithNotification, getAllVisitsForCalendar } from "../controllers/visitController.js";
import { getVisitsByUser, deleteVisitById, deleteAllVisitsByUser } from "../models/mysqlModel.js";
const router = express.Router();

// POST /api/visits
router.post("/", addVisitWithNotification);

// GET /api/visits?firebase_uid=...
router.get("/", async (req, res) => {
  const firebase_uid = req.query.firebase_uid;
  if (!firebase_uid) {
    return res.status(400).json({ success: false, error: "firebase_uid is required" });
  }
  try {
    let visits = await getVisitsByUser(firebase_uid);
    if (!Array.isArray(visits)) {
      visits = [];
    }
    res.json(visits);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, visits: [] });
  }
});

// DELETE /api/visits/all?firebase_uid=... - delete all visits for a user
router.delete("/all", async (req, res) => {
  const firebase_uid = req.query.firebase_uid;
  if (!firebase_uid) {
    return res.status(400).json({ success: false, error: "firebase_uid is required" });
  }
  try {
    const success = await deleteAllVisitsByUser(firebase_uid);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/visits/:id - delete a single visit by id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const success = await deleteVisitById(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Visit not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/visits/all-calendar - admin fetch all visits for calendar
router.get("/all-calendar", getAllVisitsForCalendar);

export default router;