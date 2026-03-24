import React, { createContext, useCallback, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { authAPI } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Single auth listener - fires immediately on mount with current session
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state:', event, '| Logged in:', !!currentSession);

      if (currentSession) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email,
          name: currentSession.user.user_metadata?.full_name || ''
        });

        // Notify backend (non-blocking)
        authAPI.callback({
          user: currentSession.user,
          session: currentSession
        }).catch(err => console.error('Backend callback failed:', err));
      } else {
        setSession(null);
        setUser(null);
      }

      // Always mark loading as done after state change
      setLoading(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    logout,
    isAuthenticated: !!session && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
