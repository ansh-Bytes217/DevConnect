// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No authentication token, access denied' });

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
