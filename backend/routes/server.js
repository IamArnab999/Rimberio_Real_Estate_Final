import clientRoutes from "../../routes/mysqlClientRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatHistoryRoutes from "../../routes/chatHistoryRoutes.js";
import paymentRoutes from "../../routes/paymentRoutes.js";
app.use("/api", clientRoutes); // Add client routes

// Register routes
app.use("/api", userRoutes);

// Add chat history routes
app.use("/api/chat-history", chatHistoryRoutes);

// Add payment routes
app.use("/api/payment", paymentRoutes);