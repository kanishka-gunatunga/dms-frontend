"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";

interface UserContextType {
  userId: string | null;
  email: string | null;
  userName: string | null;
  userType: string | null;
  setUserInfo: (userId: string, email: string, userName: string, userType: string) => void;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("Error: UserProvider is not wrapped around the component.");
  }
  return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedUserId = Cookies.get("userId");
    const storedEmail = Cookies.get("userEmail");
    const storedName = Cookies.get("userName");
    const storedUserType = Cookies.get("userType");

    if (storedUserId) setUserId(storedUserId);
    if (storedEmail) setEmail(storedEmail);
    if (storedName) setUserName(storedName);
    if (storedUserType) setUserType(storedUserType);
    setIsLoaded(true);
  }, []);

  // console.log("name  : ",userName)

  const setUserInfo = (userId: string, email: string, userName: string, userType: string,) => {
    setUserId(userId);
    setEmail(email);
    setUserName(userName)
    setUserType(userType)
    Cookies.set("userId", userId, { expires: 7 });
    Cookies.set("userEmail", email, { expires: 7 });
    Cookies.set("userName", userName, { expires: 7 });
    Cookies.set("userType", userType, { expires: 7 });
  };

  return (
    <UserContext.Provider value={{ userId, email, userName, userType, setUserInfo }}>
       {isLoaded && children} 
    </UserContext.Provider>
  );
};
