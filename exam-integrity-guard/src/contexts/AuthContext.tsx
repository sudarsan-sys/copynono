import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage to persist login state across refreshes
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  });

  // Login Function: Connects to Backend API
  const login = async (identifier, password, role) => {
    try {
      // API Call to your Node.js Backend
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier, // This can be email (Invigilator) or RegNo (Student)
        password,   // Sent for future implementation, currently checked loosely by backend
        role
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        console.error("Login failed:", response.data.message);
        return false;
      }
    } catch (error) {
      // Handle network errors or server-side errors (401, 500)
      console.error("Login Error:", error.response?.data?.message || error.message);
      return false;
    }
  };

  // Logout Function: Clears state and storage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check authentication status
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};