import express from "express";
import { createSupportTicket } from "../controllers/supportTicketController.js";
import { verifyToken } from "../auth/authMiddleware.js"; // Use Firebase token verification

const router = express.Router();

router.post("/", verifyToken, createSupportTicket);

export default router;