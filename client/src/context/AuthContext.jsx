import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, updateUserSettings } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Not authenticated or expired session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapUser();
  }, []);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (userData) => {
    const response = await registerUser(userData);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  const updateSettings = async (settings) => {
    const response = await updateUserSettings(settings);
    setUser(response.data.user);
    return response.data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
