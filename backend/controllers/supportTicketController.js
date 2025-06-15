import db from "../config/mysqlConfig.js";
import { sendThankYouEmail, sendAdminSupportTicketEmail } from "../services/emailService.js";
export const createSupportTicket = async (req, res) => {
  try {
    const { ticketNumber, userName, userEmail, avatar, propertyName, message, emoji } = req.body;
    await db.query(
      "INSERT INTO support_tickets (ticket_number, user_name, user_email, avatar, property_name, message, emoji, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [ticketNumber, userName, userEmail, avatar, propertyName, message, emoji]
    );
    // Send a thank you email with the ticket number
    await sendThankYouEmail(userEmail, userName, ticketNumber);
    // Send an email notification to the admin/owner with all ticket details
    await sendAdminSupportTicketEmail({
      ticketNumber,
      userName,
      userEmail,
      avatar,
      propertyName,
      message,
      emoji
    });
    res.status(201).json({ success: true, ticketNumber });
  } catch (err) {
    console.error("Error saving support ticket:", err);
    res.status(500).json({ error: "Failed to save support ticket" });
  }
};

export const addAdditionalDetails = async (req, res) => {
    try {
      const { userName, userEmail, avatar, additionalDetails } = req.body;
      await db.query(
        "INSERT INTO support_ticket_additional_details (user_name, user_email, avatar, details, created_at) VALUES (?, ?, ?, ?, NOW())",
        [userName, userEmail, avatar, additionalDetails]
      );
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("Error saving additional details:", err);
      res.status(500).json({ error: "Failed to save additional details" });
    }
  };