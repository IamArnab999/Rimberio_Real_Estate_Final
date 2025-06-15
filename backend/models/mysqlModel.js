// Central aggregator for all model functions
export * from './userModel.js';
export * from './reviewModel.js';
export * from './notificationModel.js';
export * from './paymentModel.js';
export * from './visitModel.js';
export * from './wishlistModel.js';
export * from './newsletterModel.js';
export * from './clientModel.js';
// Update property status by property_name (or ideally by id)
import db from '../config/mysqlConfig.js';

export const updateProperty = async (id, updates, property_name = null) => {
  // If id is null and property_name is provided, update by property_name
  if (!id && property_name) {
    const { status } = updates;
    await db.query('UPDATE properties SET status = ? WHERE title = ?', [status, property_name]);
    return;
  }
  // Default: update by id
  const { title, price, status, beds, baths, sqft, imageUrl, mapUrl } = updates;
  await db.query(
    'UPDATE properties SET title = ?, price = ?, status = ?, beds = ?, baths = ?, sqft = ?, imageUrl = ?, mapUrl = ? WHERE id = ?',
    [title, price, status, beds, baths, sqft, imageUrl, mapUrl, id]
  );
};
