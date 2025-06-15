import { addPayment, cancelPayment, getPayment } from "../models/mysqlModel.js";

// Add a new payment
export const addPaymentController = async (req, res) => {
  try {
    const paymentId = await addPayment(req.body);
    res.status(201).json({ payment_id: paymentId, ...req.body });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ message: "Failed to add payment" });
  }
};

// Cancel a payment
export const cancelPaymentController = async (req, res) => {
  const { razorpay_payment_id } = req.body;
  try {
    const success = await cancelPayment(razorpay_payment_id);
    if (success) {
      res.status(200).json({ message: "Payment cancelled" });
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (err) {
    console.error("Error cancelling payment:", err);
    res.status(500).json({ message: "Failed to cancel payment" });
  }
};

// Get payment details
export const getPaymentController = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id } = req.query;
  try {
    const payment = await getPayment({ razorpay_payment_id, razorpay_order_id });
    if (payment) {
      res.status(200).json(payment);
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
};
