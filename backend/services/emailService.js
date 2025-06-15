import nodemailer from "nodemailer";

export const sendThankYouEmail = async (to, name, ticketNumber) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // App password
    },
    ...(process.env.NODE_ENV !== "production" && {
      tls: { rejectUnauthorized: false },
    }),
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "🌟 Thank you for reaching out!",
    html: `
      <div style="background:linear-gradient(120deg,#e0e7ff 0%,#f8fafc 100%);padding:0;margin:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:transparent;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;margin:40px 0;">
              <tr>
                <td style="background:linear-gradient(90deg,#14b8a6 0%,#2563eb 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                  <h1 style="margin:0;font-size:2.2rem;letter-spacing:1px;">Thank You for Contacting Us!</h1>
                  <p style="margin:16px 0 0 0;font-size:1.1rem;">Hi ${name || "Guest"}, your support ticket has been received.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px 16px 24px;">
                  <div style="font-size:1.1rem;color:#2563eb;margin-bottom:10px;">Your Ticket Number: <b>${ticketNumber}</b></div>
                  <p style="font-size:1.05rem;color:#334155;">Our support team will review your request and get back to you as soon as possible. You can reply to this email if you have more details to add.</p>
                  <div style="margin:30px 0 0 0;text-align:center;">
                    <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Support" width="80" style="margin-bottom:10px;"/>
                  </div>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 18px 0;">
                  <p style="color:#64748b;font-size:1rem;">Thank you for helping us improve Rimberio!<br/>Best regards,<br/><b>Rimberio Support Team</b></p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </div>`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendAdminSupportTicketEmail = async (ticket) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    ...(process.env.NODE_ENV !== "production" && {
      tls: { rejectUnauthorized: false },
    }),
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_EMAIL is not set in environment variables");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Support Ticket Submitted: #${ticket.ticketNumber}`,
    html: `
      <div style="background:linear-gradient(120deg,#f8fafc 0%,#e0e7ff 100%);padding:0;margin:0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:transparent;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;margin:40px 0;">
              <tr>
                <td style="background:linear-gradient(90deg,#2563eb 0%,#14b8a6 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                  <h1 style="margin:0;font-size:2.2rem;letter-spacing:1px;">New Support Ticket</h1>
                  <p style="margin:16px 0 0 0;font-size:1.1rem;">A new support ticket has been submitted.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px 16px 24px;">
                  <div style="font-size:1.1rem;color:#2563eb;margin-bottom:10px;">Ticket Number: <b>${ticket.ticketNumber}</b></div>
                  <p style="font-size:1.05rem;color:#334155;"><b>Submitted By:</b> ${ticket.userName} (${ticket.userEmail})</p>
                  ${ticket.avatar ? `<img src="${ticket.avatar}" alt="User Avatar" width="48" height="48" style="border-radius:50%;margin-bottom:10px;"/>` : ''}
                  <p style="font-size:1.05rem;color:#334155;"><b>Property Name:</b> ${ticket.propertyName}</p>
                  <p style="font-size:1.05rem;color:#334155;"><b>Issue/Message:</b> ${ticket.message}</p>
                  <p style="font-size:1.05rem;color:#334155;"><b>Experience/Emoji:</b> ${ticket.emoji}</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:36px 0 18px 0;">
                  <p style="font-size:0.98rem;color:#888;">This ticket is now visible in the Support Tickets tab. Please review and respond in the admin dashboard.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </div>`,
  };
  await transporter.sendMail(mailOptions);
};

export async function sendNewsletterEmail(to, html) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    ...(process.env.NODE_ENV !== "production" && {
      tls: { rejectUnauthorized: false },
    }),
  });
  await transporter.sendMail({
    from: `Real Estate Newsletter <${process.env.EMAIL_USER}>`,
    to,
    subject: "🏡 Your Real Estate Property Recommendations!",
    html,
  });
}