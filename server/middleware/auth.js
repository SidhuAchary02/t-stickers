import { supabase } from '../config/supabase.js';

/**
 * Middleware to verify Supabase session token
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to optionally get user (doesn't throw if missing)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email
        };
      }
    }
  } catch (error) {
    // Silent fail, user is optional
    console.warn('Optional auth failed (non-blocking):', error.message);
  }

  next();
};

/**
 * Create a session token for frontend authentication
 */
export const createSessionToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });
};
