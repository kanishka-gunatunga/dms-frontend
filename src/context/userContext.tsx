"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  email: string | null;
  setUserInfo: (userId: string, email: string) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("Error user provider");
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const setUserInfo = (userId: string, email: string) => {
    setUserId(userId);
    setEmail(email);
  };

  return (
    <UserContext.Provider value={{ userId, email, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};
