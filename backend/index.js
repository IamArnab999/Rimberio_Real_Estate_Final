import express from "express";
import cors from "cors";
import geminiChatRouter from "./chat_server/api/gemini-chat.mjs";
import mysqlRoutes from "./routes/mysqlRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import exampleRoutes from "./routes/exampleRoute.js";
import { authMiddleware, verifyToken } from "./auth/authMiddleware.js";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes.js"; // Import the payment routes
import newsletterRoutes from "./routes/newsletterRoutes.js";
import supportTicketRoute from "./routes/supportTicketRoute.js";
import cron from "node-cron";
import { sendNewsletterToAllSubscribers } from "./services/newsletterCron.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"; // Import review routes
import notificationsRoutes from "./routes/notificationsRoutes.js"; // Import notifications routes
import visitsRoutes from "./routes/visits.js"; // Import visits routes
import chatHistoryRoutes from "./routes/chatHistoryRoutes.js"; // Import chat history routes
import sendMailRoute from "./routes/sendMailRoute.js"; // Import sendMailRoute
import analyticsRoutes from "./routes/analyticsRoutes.js"; // Use ES module import
import propertyRoutes from "./routes/propertyRoutes.js"; // Import property routes
import geocodeRoutes from "./routes/geocodeRoutes.js"; // Import geocode proxy route
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));

// Schedule newsletter every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Sending scheduled newsletter to all subscribers...");
  await sendNewsletterToAllSubscribers();
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
     process.env.REACT_APP_FRONTEND_URL, "http://localhost:5173", "https://vp41bxr5-5000.inc1.devtunnels.ms"
    ];

    // Log the origin for debugging
    console.log("CORS request from origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies or credentials
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allowed HTTP methods
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", mysqlRoutes); // Register the /api routes

app.use("/api/support-tickets", supportTicketRoute);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/visits", visitsRoutes); // Register visitsRoutes under /api
// Routes
app.use("/api/gemini-chat", geminiChatRouter);
// In-memory chat history (for demo purposes)
app.use("/api/payments", paymentRoutes);
app.use("/api", userRoutes);
app.use('/api/users', userRoutes);
app.use("/api/example", exampleRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api", reviewRoutes); // Register reviewRoutes under /api
app.use("/api/notifications", notificationsRoutes); // Register notificationsRoutes under /api
app.use("/api/chat-history", chatHistoryRoutes); // Register chat history routes
app.use("/api", sendMailRoute); // Register sendMailRoute under /api
app.use("/api/analytics", analyticsRoutes.default || analyticsRoutes); // Register analyticsRoutes under /api
app.use('/api/properties', propertyRoutes); // Register propertyRoutes under /api
app.use("/api", geocodeRoutes); // Register geocode proxy route

// Protected routes
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "You are authenticated!" });
});
app.get("/api/secure-profile", authMiddleware, (req, res) => {
  res.json({ message: "This is a secure profile route!", user: req.user });
});
// POST request to add a new message to the chat history
// app.post("/api/chat-history", (req, res) => {
//   const { sender, message } = req.body;

//   if (!sender || !message) {
//     return res.status(400).json({ error: "Sender and message are required" });
//   }

//   const newMessage = {
//     id: chatHistory.length + 1, // Incremental ID
//     sender,
//     message,
//     timestamp: new Date().toISOString(),
//   };

//   chatHistory.push(newMessage); // Add the new message to the history
//   res.status(201).json(newMessage); // Respond with the newly added message
// });

// // Optional: Clear chat history
// app.delete("/api/chat-history", (req, res) => {
//   chatHistory = []; // Clear the in-memory chat history
//   res.status(200).json({ message: "Chat history cleared" });
// });
app.get("/", (req, res) => {
  res.send("API is live!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
