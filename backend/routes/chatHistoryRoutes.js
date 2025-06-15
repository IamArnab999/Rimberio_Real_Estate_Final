import express from "express";
import {
  saveChatMessage,
  getChatHistory,
  clearChatHistory,
  exportChatHistoryJson,
  exportChatHistoryPdf,
} from "../controllers/chatHistoryController.js";

const router = express.Router();

router.post("/", saveChatMessage);
router.get("/", getChatHistory);
router.delete("/", clearChatHistory);
router.get("/export/json", exportChatHistoryJson);
router.get("/export/pdf", exportChatHistoryPdf);

export default router;