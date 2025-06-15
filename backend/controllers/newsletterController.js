import { getAllNewsletterSubscriptions } from "../models/newsletterModel.js";

// Newsletter Controller Placeholder

export const placeholderNewsletterController = () => {};

// Get all newsletter subscriptions for calendar
export const getAllNewsletterSubscriptionsForCalendar = async (req, res) => {
  try {
    const subs = await getAllNewsletterSubscriptions();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
