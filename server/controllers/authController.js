import { upsertUser, getUserProfile } from '../services/databaseService.js';

/**
 * POST /api/auth/callback
 * Handle OAuth callback - user session already created by Supabase
 */
export const authCallback = async (req, res) => {
  try {
    const { user, session } = req.body;

    console.log('Auth callback received:', { userId: user?.id, email: user?.email });

    if (!user || !user.id || !user.email || !session) {
      return res.status(400).json({ 
        error: 'Invalid user data or session provided',
        received: { user, session } 
      });
    }

    // Upsert user in database
    try {
      const profile = await upsertUser(user.id, user.email);
      console.log('User profile created/updated');
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB fails
    }

    res.json({
      success: true,
      session,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || ''
      }
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ 
      error: error.message || 'Authentication failed'
    });
  }
};

/**
 * GET /api/auth/profile
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const profile = await getUserProfile(req.user.id);
      res.json({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at
      });
    } catch (dbError) {
      // If user not in DB, return from auth token
      res.json({
        id: req.user.id,
        email: req.user.email || req.user.user_metadata?.email,
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * POST /api/auth/logout
 * Logout endpoint (mainly for cleanup if needed)
 */
export const logout = async (req, res) => {
  // Token invalidation is handled on frontend
  res.json({ success: true });
};
