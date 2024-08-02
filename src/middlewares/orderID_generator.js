const { v4: uuidv4 } = require('uuid');

// Middleware function to generate a unique order ID
function generateOrderId(req, res, next) {
  req.orderId = uuidv4(); 
  next();
}

module.exports = generateOrderId;
