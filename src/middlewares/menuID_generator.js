const { v4: uuidv4 } = require('uuid');

// Middleware function to generate a unique menu ID
function generateMenuId(req, res, next) {
  req.menuId = uuidv4(); 
  next();
}

module.exports = generateMenuId;