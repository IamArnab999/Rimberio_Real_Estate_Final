import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { addPaymentController, cancelPaymentController } from "../controllers/mysqlController.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import https from 'https';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

router.post("/verify", async (req, res) => {
  // Destructure all fields matching your payments table
  const {
    firebase_uid,
    user_email,
    property_name,
    imageUrl,
    user_name,
    phone,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    payment_method, // <-- add this
  } = req.body;

  // Debug log all required fields
  console.log("[PAYMENT VERIFY] Required fields:", {
    firebase_uid,
    user_email,
    property_name,
    imageUrl,
    user_name,
    phone,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
  });

  // Validate required fields
  if (!firebase_uid || !user_email || !property_name || !imageUrl || !user_name || !phone || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount || !currency) {
    return res.status(400).json({ error: "Missing required payment fields. Please contact support.", debug: {
      firebase_uid,
      user_email,
      property_name,
      imageUrl,
      user_name,
      phone,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      payment_method, // <-- add this to debug
    }});
  }

  // Debug log to verify payment data
  console.log("[PAYMENT VERIFY] paymentData:", req.body);

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature == razorpay_signature) {
    // Save payment to DB with all required fields for your schema
    const { addPayment, updateProperty } = await import("../models/mysqlModel.js");
    await addPayment({
      firebase_uid,
      user_email,
      property_name,
      imageUrl,
      user_name,
      phone,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency: currency || "INR",
      payment_status: "success",
      payment_method, // <-- store in DB if schema supports
    });
    // --- NEW: Mark property as Sold ---
    if (property_name) {
      // Find property by name and set status to 'Sold'
      // You may want to use property_id instead for reliability
      await updateProperty(
        // Find property by name (or ideally by id if available)
        // Here, we assume property_name is unique enough
        // You can enhance this to use property_id if you pass it from frontend
        // For now, let's update all matching property_name
        // (If you want to use property_id, adjust accordingly)
        null, // id placeholder
        { status: "Sold" },
        property_name // pass property_name for update by name
      );
    }
    res.status(200).json({ Status: "Payment verified" });
  } else {
    // Cancel payment in DB if signature is invalid
    const mockReq = { body: { razorpay_payment_id } };
    await cancelPaymentController(mockReq, res);
    res.status(400).json({ status: "Invalid Signature" });
  }
});

router.post("/send-invoice", async (req, res) => {
  const { name, email, address, phone, razorpay_payment_id, razorpay_order_id, property_name, property_image_url, imageUrl, payment_method } = req.body;
  try {
    // 1. Create Razorpay Invoice
    const invoice = await razorpay.invoices.create({
      type: "invoice",
      description: `Advance Payment Invoice for ${property_name || ''} (Building Advance)` + (payment_method ? `\n Payment Method: ${payment_method}` : ""),
      customer: {
        name: name,
        email: email,
      },
      line_items: [
        {
          name: `Advance Payment for ${property_name || ''}`,
          amount: 50000 * 100, // or use your dynamic amount
          currency: "INR",
          quantity: 1
        }
      ],
      notes: {
        property_name: property_name || '',
        property_image_url: property_image_url || imageUrl || '',
        payment_method: payment_method || '',
        extra_details: `Advance payment for booking the property. This is an advance for the building. Balance to be paid as per agreement.`
      },
      email_notify: 1,
      sms_notify: 0
    });

    const invoiceNumber = invoice.id;

    // --- Download property image based on payment_id ---
    let imgBuffer = null;
    let propertyImageUrlToUse = property_image_url || imageUrl;
    if (!propertyImageUrlToUse && razorpay_payment_id) {
      // Try to fetch the property image from the DB using payment_id
      const { getPropertyImageByPaymentId } = await import("../models/mysqlModel.js");
      propertyImageUrlToUse = await getPropertyImageByPaymentId(razorpay_payment_id);
    }
    if (propertyImageUrlToUse) {
      // Download the image (Azure Blob or any HTTPS URL)
      imgBuffer = await new Promise((resolve, reject) => {
        https.get(propertyImageUrlToUse, (response) => {
          const data = [];
          response.on('data', (chunk) => data.push(chunk));
          response.on('end', () => {
            if (response.statusCode === 200 && data.length > 0) {
              resolve(Buffer.concat(data));
            } else {
              resolve(null);
            }
          });
          response.on('error', reject);
        }).on('error', reject);
      });
    }

    // --- Stylish PDF Generation ---
    const doc = new PDFDocument({ margin: 40 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      console.log("Attempting to send invoice email to:", email);

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false, // 👈 Add this to allow self-signed certificates
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Payment Invoice",
        text: `Thank you for your payment. Please find your invoice attached.\nInvoice Number: ${invoiceNumber}`,
        attachments: [
          {
            filename: `Invoice-${invoiceNumber}.pdf`,
            content: pdfData,
          },
        ],
      });

      res.json({ message: "Invoice sent successfully" });
      console.log("Invoice email sent to:", email);
    });

    // --- PDF Content ---
    const primaryColor = "#2563eb";
    const secondaryColor = "#f1f5f9";

    // Header bar
    doc.rect(0, 0, doc.page.width, 60).fill(primaryColor);
    doc.fillColor("#fff").fontSize(24).font("Helvetica-Bold").text("Rimberio Real Estate", 40, 18, { align: "left" });
    doc.fillColor("#fff").fontSize(12).font("Helvetica").text("Payment Invoice", 0, 22, { align: "right", width: doc.page.width - 40 });

    // Stylish Invoice Details Box
    const detailsTop = 90;
    const detailsLeft = 40;
    const detailsWidth = doc.page.width - 80;
    const detailsHeight = 250; // Increased height
    doc.roundedRect(detailsLeft, detailsTop, detailsWidth, detailsHeight, 10).fill(secondaryColor);
    doc.fillColor("#222").fontSize(18).font("Helvetica-Bold").text("Invoice Details", detailsLeft + 15, detailsTop + 15, { underline: true });
    let y = detailsTop + 45;
    doc.fontSize(12).font("Helvetica").fillColor("#222")
      .text(`Invoice Number: ${invoiceNumber}`, detailsLeft + 15, y)
      .text(`Property Name: ${property_name || ''}`, detailsLeft + 15, y + 18)
      .text(`Date: ${new Date().toLocaleString()}`, detailsLeft + 15, y + 36)
      .text(`Name: ${name}`, detailsLeft + 15, y + 54)
      .text(`Email: ${email}`, detailsLeft + 15, y + 72)
      .text(`Address: ${address}`, detailsLeft + 15, y + 90)
      .text(`Razorpay Payment ID: ${razorpay_payment_id}`, detailsLeft + 15, y + 108)
      .text(`Razorpay Order ID: ${razorpay_order_id}`, detailsLeft + 15, y + 126)
      .text(`Payment Method: ${payment_method || 'N/A'}`, detailsLeft + 15, y + 144)
      .text(`Purpose: Advance payment for booking the property. This is an advance for the building.`, detailsLeft + 15, y + 162, { width: detailsWidth - 30 });

    // Add property image on the right side of the details box (if buffer exists)
    if (imgBuffer) {
      try {
        // Make the image bigger
        const imageX = detailsLeft + detailsWidth - 180; // move a bit more left if needed
        const imageY = detailsTop + 20;
        const imageWidth = 160; // was 100
        const imageHeight = 160; // was 100
        doc.image(imgBuffer, imageX, imageY, { width: imageWidth, height: imageHeight, align: 'right' });
      } catch (e) {
        doc.fontSize(10).fillColor('red').text('Image could not be loaded', detailsLeft + detailsWidth - 120, detailsTop + 130);
      }
    } else {
      // Optionally show a placeholder or message
      // doc.fontSize(10).fillColor('red').text('No image provided', detailsLeft + detailsWidth - 120, detailsTop + 130);
    }

    // Payment summary - prominent and centered
    doc.moveDown(8).fontSize(20).fillColor(primaryColor).font("Helvetica-Bold").text("Amount Paid:  INR 50,000", { align: "center", underline: true });
    doc.moveDown(2).fontSize(13).fillColor("#222").font("Helvetica").text("Thank you for your payment!", { align: "center" });
    doc.moveDown(2).fontSize(10).fillColor("#888").text("If you have any questions about this invoice, please contact us at support@rimberio.com", { align: "center" });
    doc.end();

  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});

router.post("/create-payment-link", async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: currency || "INR",
      description: "Payment for order",
    });
    res.json({ url: paymentLink.short_url });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment link" });
  }
});
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: crypto.randomBytes(10).toString("hex"),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).send("Error creating order");
  }
});

router.post("/fetch-payment-details", async (req, res) => {
  const { razorpay_payment_id } = req.body;
  try {
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    res.json({ method: payment.method, ...payment });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});

export default router;