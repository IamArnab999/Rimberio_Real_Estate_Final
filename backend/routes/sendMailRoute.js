import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/sendMail
router.post("/sendMail", async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Configure your transporter (use your real credentials in production)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Set in your .env
        pass: process.env.EMAIL_PASS, // Set in your .env
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html, // Allow sending HTML for stylish emails
    });
    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
