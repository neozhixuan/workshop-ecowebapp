import React, { useEffect, useState } from "react";
import { auth } from "./FirebaseConfig";

export const AuthContext = React.createContext();

// Authentication Wrapper
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(setCurrentUser);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
