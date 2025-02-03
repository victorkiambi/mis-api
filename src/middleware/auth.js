const jwt = require('jsonwebtoken');

const auth = {
  // Verify JWT token
  verifyToken: (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token'
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Authentication error'
      });
    }
  }
};

module.exports = auth; 