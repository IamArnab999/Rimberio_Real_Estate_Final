import { getActiveNewsletterSubscribers } from "../models/mysqlModel.js";
import { sendNewsletterEmail } from "../services/emailService.js";
import crypto from "crypto";
import { getAllProperties } from "../models/propertyModel.js";

function getRandomProperties(all, count = 3) {
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateUnsubscribeToken(email) {
  return crypto.createHash("sha256").update(email + process.env.EMAIL_USER).digest("hex");
}

function getFrontendUrl() {
  return process.env.REACT_APP_FRONTEND_URL || process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || "";
}

function generateNewsletterHtml(recommendations, email) {
  const unsubscribeUrl = `${process.env.VITE_BACKEND_URL }/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${generateUnsubscribeToken(email)}`;
  return `
    <div style="background:linear-gradient(120deg,#e0e7ff 0%,#f8fafc 100%);padding:0;margin:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:transparent;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;margin:40px 0;">
              <tr>
                <td style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                  <h1 style="margin:0;font-size:2.4rem;letter-spacing:1px;">Your Real Estate Newsletter</h1>
                  <p style="margin:16px 0 0 0;font-size:1.15rem;">Here are some properties you might like!</p>
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
                            <a href="${rec.link || '#'}" style="text-decoration:none;color:inherit;display:block;">
                              <img src="${rec.image || ''}" alt="${rec.title}" style="width:100%;max-width:180px;height:120px;object-fit:cover;display:block;border-radius:0 0 10px 10px;">
                              <div style="padding:14px 10px 10px 10px;">
                                <h3 style="font-size:1.08rem;margin:0 0 6px 0;font-weight:600;color:#1e293b;">${rec.title}</h3>
                                <div style="font-size:0.98rem;color:#475569;margin-bottom:2px;"><b>${rec.price}</b>${rec.location ? ` | ${rec.location}` : ''}</div>
                                <div style="font-size:0.93rem;color:#64748b;margin-bottom:10px;">${rec.description || ''}</div>
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
                    <a href="${getFrontendUrl()}/discover" style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.13rem;display:inline-block;box-shadow:0 2px 8px #b6c1e0;">Explore More Properties</a>
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
}

// Helper to get the latest properties added in the last N hours
async function getRecentProperties(hours = 6) {
  const all = await getAllProperties();
  const now = new Date();
  return all.filter(p => {
    const created = new Date(p.created_at || p.createdAt || p.timestamp || 0);
    return (now - created) / (1000 * 60 * 60) <= hours;
  });
}

export async function sendNewsletterToAllSubscribers() {
  const emails = await getActiveNewsletterSubscribers();
  let allProperties = await getAllProperties();
  allProperties = allProperties.map((p) => ({
    title: p.title,
    image: p.imageUrl || p.image || '',
    link: `${getFrontendUrl()}/see_more?property_id=${p.id}`,
    price: p.price ? `₹ ${p.price}` : '',
    location: p.address || '',
    description: p.status || '',
    created_at: p.created_at || p.createdAt || p.timestamp || '',
  }));

  for (const email of emails) {
    // Get new properties from the last 6 hours
    const newProps = (await getRecentProperties(6)).map((p) => ({
      title: p.title,
      image: p.imageUrl || p.image || '',
      link: `${process.env.VITE_BACKEND_URL }/property/${p.id}`,
      price: p.price ? `₹ ${p.price}` : '',
      location: p.address || '',
      description: p.status || '',
    }));
    // Get existing (older) properties
    const oldProps = allProperties.filter(p => !newProps.find(np => np.link === p.link));
    // Pick 1-2 new and 1-2 old properties for variety
    const newCount = Math.min(newProps.length, Math.floor(Math.random() * 2) + 1);
    const oldCount = Math.min(oldProps.length, Math.floor(Math.random() * 2) + 1);
    const recommendations = [
      ...getRandomProperties(newProps, newCount),
      ...getRandomProperties(oldProps, oldCount)
    ];
    const html = generateNewsletterHtml(recommendations, email);
    await sendNewsletterEmail(email, html);
  }
}

// For first-time subscription: show 3 random properties from the latest hour
export async function getFirstTimeRecommendations() {
  // Get recent properties from the last hour
  let recent = (await getRecentProperties(1)).map((p) => ({
    title: p.title,
    image: p.imageUrl || p.image || '',
    link: `${getFrontendUrl()}/see_more?property_id=${p.id}`,
    price: p.price ? `₹ ${p.price}` : '',
    location: p.address || '',
    description: p.status || '',
  }));
  // If less than 3, fill with older properties
  if (recent.length < 3) {
    let all = (await getAllProperties()).map((p) => ({
      title: p.title,
      image: p.imageUrl || p.image || '',
      link: `${getFrontendUrl()}/see_more?property_id=${p.id}`,
      price: p.price ? `₹ ${p.price}` : '',
      location: p.address || '',
      description: p.status || '',
    }));
    // Remove duplicates
    const recentLinks = new Set(recent.map(r => r.link));
    const older = all.filter(p => !recentLinks.has(p.link));
    recent = [...recent, ...getRandomProperties(older, 3 - recent.length)];
  }
  return getRandomProperties(recent, 3);
}
