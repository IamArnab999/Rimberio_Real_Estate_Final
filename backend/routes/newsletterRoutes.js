import express from "express";
import nodemailer from "nodemailer";
import { addOrUpdateNewsletterSubscriber, unsubscribeNewsletter, getActiveNewsletterSubscribers } from "../models/mysqlModel.js";
import { getAllNewsletterSubscriptions } from "../models/newsletterModel.js";
import crypto from "crypto";
import { getFirstTimeRecommendations } from '../services/newsletterCron.js';
import { getAllProperties } from "../models/propertyModel.js";

const router = express.Router();

function getRandomProperties(all, count = 3) {
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper to generate a simple unsubscribe token (for demo, use email hash)
function generateUnsubscribeToken(email) {
  return crypto.createHash("sha256").update(email + process.env.EMAIL_USER).digest("hex");
}

// Subscribe endpoint
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await addOrUpdateNewsletterSubscriber(email);
  } catch (err) {
    console.error("DB error in addOrUpdateNewsletterSubscriber:", err);
    return res.status(500).json({ error: "Database error: " + err.message });
  }

  // Send confirmation email immediately with 3 recent properties from the last hour
  try {
    // Fetch real properties, not dummy
    const recommendations = await getFirstTimeRecommendations();
    const unsubscribeUrl = `${process.env.VITE_BACKEND_URL || "https://yourwebsite.com"}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${generateUnsubscribeToken(email)}`;
    const html = `
      <div style="background:linear-gradient(120deg,#e0e7ff 0%,#f8fafc 100%);padding:0;margin:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:transparent;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;margin:40px 0;">
                <tr>
                  <td style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                    <h1 style="margin:0;font-size:2.4rem;letter-spacing:1px;">Thank You for Subscribing!</h1>
                    <p style="margin:16px 0 0 0;font-size:1.15rem;">You’re now part of our exclusive real estate newsletter.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 24px 16px 24px;">
                    <h2 style="color:#2563eb;font-size:1.35rem;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
                      <span style="font-size:1.5rem;">🏡</span> Recommended Properties for You
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
                      <tr>
                        ${recommendations.map(rec => `
                          <td class="property-card" align="center" valign="top" style="padding:12px 8px;width:33%;max-width:200px;">
                            <div style="background:#f8fafc;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px #e0e7ef;transition:box-shadow 0.2s;">
                              <div style="height:5px;background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);"></div>
                              <a href="${rec.link}" style="text-decoration:none;color:inherit;display:block;">
                                <img src="${rec.image}" alt="${rec.title}" style="width:100%;max-width:180px;height:120px;object-fit:cover;display:block;border-radius:0 0 10px 10px;">
                                <div style="padding:14px 10px 10px 10px;">
                                  <h3 style="font-size:1.08rem;margin:0 0 6px 0;font-weight:600;color:#1e293b;">${rec.title}</h3>
                                  <div style="font-size:0.98rem;color:#475569;margin-bottom:2px;"><b>${rec.price}</b> | ${rec.location}</div>
                                  <div style="font-size:0.93rem;color:#64748b;margin-bottom:10px;">${rec.description}</div>
                                  <span style="display:inline-block;background:#2563eb;color:#fff;padding:7px 18px;border-radius:5px;font-size:0.97rem;font-weight:500;text-decoration:none;margin-top:6px;">View Details →</span>
                                </div>
                              </a>
                            </div>
                          </td>
                        `).join('')}
                      </tr>
                    </table>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 18px 0;">
                    <p style="margin:0;color:#555;font-size:1.07rem;">
                      Stay tuned for the latest updates, tips, and exclusive offers from our real estate experts!
                    </p>
                    <div style="margin-top:28px;text-align:center;">
                      <a href="${process.env.REACT_APP_FRONTEND_URL}/see_more" style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.13rem;display:inline-block;box-shadow:0 2px 8px #b6c1e0;">Explore More Properties</a>
                    </div>
                    <div style="margin-top:18px;font-size:0.95rem;">
                      <a href="${unsubscribeUrl}" style="color:#ef4444;">Unsubscribe</a> from these emails.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f1f5f9;color:#888;text-align:center;padding:18px 10px 12px 10px;font-size:1rem;border-radius:0 0 18px 18px;">
                    <div style="margin-bottom:4px;">&copy; ${new Date().getFullYear()} <b>Rimberio Real Estate Platform</b>. All rights reserved.</div>
                    <div style="font-size:0.95rem;">You are receiving this email because you subscribed to our newsletter.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        <style>
          .responsive-table {width:100% !important;}
        </style>
        <![endif]-->
        <style>
          @media only screen and (max-width: 620px) {
            table[class="responsive-table"] {width:100% !important;}
            .property-card, td.property-card {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin-bottom: 18px !important;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
            }
          }
        </style>
      </div>
    `;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Real Estate Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Our Real Estate Newsletter!",
      html,
    });
    res.json({ message: "Subscribed and confirmation email sent!" });
  } catch (err) {
    console.error("Newsletter confirmation error:", err);
    return res.status(500).json({ error: "Failed to send confirmation email" });
  }
});

// Unsubscribe endpoint
router.get("/unsubscribe", async (req, res) => {
  const { email, token } = req.query;
  if (!email || !token) return res.status(400).send("Invalid request");
  const valid = token === generateUnsubscribeToken(email);
  if (!valid) return res.status(403).send("Invalid token");
  await unsubscribeNewsletter(email);
  res.send("You have been unsubscribed from the newsletter.");
});

router.post("/send-confirmation", async (req, res) => {
  const { email } = req.body;
  try {
    const allProperties = await getAllProperties();
    const recommendations = getRandomProperties(allProperties, 3);
   
    const html = `
      <div style="background:linear-gradient(120deg,#e0e7ff 0%,#f8fafc 100%);padding:0;margin:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:transparent;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;margin:40px 0;">
                <tr>
                  <td style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                    <h1 style="margin:0;font-size:2.4rem;letter-spacing:1px;">Thank You for Subscribing!</h1>
                    <p style="margin:16px 0 0 0;font-size:1.15rem;">You’re now part of our exclusive real estate newsletter.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 24px 16px 24px;">
                    <h2 style="color:#2563eb;font-size:1.35rem;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
                      <span style="font-size:1.5rem;">🏡</span> Recommended Properties for You
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
                      <tr>
                        ${recommendations.map(rec => `
                          <td class="property-card" align="center" valign="top" style="padding:12px 8px;width:33%;max-width:200px;">
                            <div style="background:#f8fafc;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px #e0e7ef;transition:box-shadow 0.2s;">
                              <div style="height:5px;background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);"></div>
                              <a href="${rec.link}" style="text-decoration:none;color:inherit;display:block;">
                                <img src="${rec.image}" alt="${rec.title}" style="width:100%;max-width:180px;height:120px;object-fit:cover;display:block;border-radius:0 0 10px 10px;">
                                <div style="padding:14px 10px 10px 10px;">
                                  <h3 style="font-size:1.08rem;margin:0 0 6px 0;font-weight:600;color:#1e293b;">${rec.title}</h3>
                                  <div style="font-size:0.98rem;color:#475569;margin-bottom:2px;"><b>${rec.price}</b> | ${rec.location}</div>
                                  <div style="font-size:0.93rem;color:#64748b;margin-bottom:10px;">${rec.description}</div>
                                  <span style="display:inline-block;background:#2563eb;color:#fff;padding:7px 18px;border-radius:5px;font-size:0.97rem;font-weight:500;text-decoration:none;margin-top:6px;">View Details →</span>
                                </div>
                              </a>
                            </div>
                          </td>
                        `).join('')}
                      </tr>
                    </table>
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 18px 0;">
                    <p style="margin:0;color:#555;font-size:1.07rem;">
                      Stay tuned for the latest updates, tips, and exclusive offers from our real estate experts!
                    </p>
                    <div style="margin-top:28px;text-align:center;">
                      <a href="${process.env.REACT_APP_FRONTEND_URL}/see_more" style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.13rem;display:inline-block;box-shadow:0 2px 8px #b6c1e0;">Explore More Properties</a>
                    </div>
                    <div style="margin-top:18px;font-size:0.95rem;">
                      <a href="${unsubscribeUrl}" style="color:#ef4444;">Unsubscribe</a> from these emails.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f1f5f9;color:#888;text-align:center;padding:18px 10px 12px 10px;font-size:1rem;border-radius:0 0 18px 18px;">
                    <div style="margin-bottom:4px;">&copy; ${new Date().getFullYear()} <b>Rimberio Real Estate Platform</b>. All rights reserved.</div>
                    <div style="font-size:0.95rem;">You are receiving this email because you subscribed to our newsletter.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        <style>
          .responsive-table {width:100% !important;}
        </style>
        <![endif]-->
        <style>
          @media only screen and (max-width: 620px) {
            table[class="responsive-table"] {width:100% !important;}
            .property-card, td.property-card {
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin-bottom: 18px !important;
            }
            img {
              max-width: 100% !important;
              height: auto !important;
            }
          }
        </style>
      </div>
    `;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Real Estate Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Our Real Estate Newsletter!",
      html,
    });

    res.json({ message: "Confirmation email sent!" });
  } catch (err) {
    console.error("Newsletter confirmation error:", err);
    res.status(500).json({ error: "Failed to send confirmation email" });
  }
});

// GET /api/newsletter/all-calendar - admin fetch all newsletter subscriptions for calendar
router.get("/all-calendar", async (req, res) => {
  console.log("[DEBUG] GET /api/newsletter/all-calendar called");
  try {
    const data = await getAllNewsletterSubscriptions();
    console.log("[DEBUG] Newsletter all-calendar data:", data);
    res.json(data);
  } catch (err) {
    console.error("[ERROR] /api/newsletter/all-calendar:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;