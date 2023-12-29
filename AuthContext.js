import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const storeToken = async (token) => {
        try {
          await AsyncStorage.setItem('userToken', token);
        } catch (error) {
          console.log(error);
        }
      };
    
      const signOut = async () => {
        try {
          await AsyncStorage.removeItem('userToken');
          setIsAuthenticated(false);
        } catch (e) {
          console.log(e);
        }
      };
    
      return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, signOut, storeToken }}>
          {children}
        </AuthContext.Provider>
      );
  };