import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const shouldLogAuthDebug = () => process.env.LOG_AUTH_DEBUG === 'true';

const debug = (...args) => {
  if (shouldLogAuthDebug()) {
    console.log(...args);
  }
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    debug('Auth middleware: missing bearer token');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      debug('Auth middleware: user not found for id', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    debug('Auth middleware: user authenticated', user.email);
    req.user = user;
    next();
  } catch (error) {
    debug('Auth middleware: token verification failed', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    req.user = user;
  } catch (error) {
    debug('Optional auth: token ignored', error.message);
  }
  next();
};

export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
