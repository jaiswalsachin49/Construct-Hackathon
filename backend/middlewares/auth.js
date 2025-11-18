const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;