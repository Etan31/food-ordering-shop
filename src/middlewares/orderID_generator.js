const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Middleware function to generate a unique order ID
function generateOrderId(req, res, next) {
  const uuid = uuidv4().replace(/-/g, ''); // Remove hyphens from UUID
  const hash = crypto.createHash('sha256').update(uuid).digest('hex'); // Hash the UUID
  req.orderId = hash.slice(0, 20); // Take the first 20 characters of the hash
  next();
}

module.exports = generateOrderId;
