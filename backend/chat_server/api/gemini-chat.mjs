import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import chatHistory from "../data/chatHistory.js";

dotenv.config();

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error(
    "API key is missing. Please set GEMINI_API_KEY in your .env file."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-03-25",
  systemInstruction:
    "You are a real estate assistant chatbot designed to help users with their property-related queries.",
});

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  console.log("Current chat history:", JSON.stringify(chatHistory));
  next();
});

// POST request to process user messages
router.post("/", async (req, res) => {
  console.log("Request received from user:", req.body); // Log the user's input
  try {
    const { message, user } = req.body; // Extract user details from the request body
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    // Ensure the user object has a valid name
    const userName = user?.name || "Guest";
    // Log user details for debugging
    console.log("User details:", { ...user, name: userName });
    // Log user details for debugging
    console.log("User details:", user);

    // Process the message and generate a response
    const chatSession = model.startChat({ history: [] });
    const result = await chatSession.sendMessage(message);

    const botReply = result.response.text();

    // Update the shared chat history with user details
    chatHistory.push({
      userMessage: `${userName}${user?.isGuest ? " (Guest)" : ""}: ${message}`, // Append "(Guest)" if user is a guest
      botReply: botReply,
      timestamp: new Date().toISOString(),
    });
    console.log("Updated chat history is:", chatHistory); // Debug log

    res.json({ reply: botReply });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;