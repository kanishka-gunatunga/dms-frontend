/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { getWithAuth } from "@/utils/apiClient";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserContext } from "./userContext";

const PermissionsContext = createContext<{ [key: string]: string[] }>({});

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<{ [key: string]: string[] }>({});
    const { userId } = useUserContext();
  

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const response = await getWithAuth(`role-details/${userId}`);
        const parsedPermissions = JSON.parse(response.permissions || "[]");
        const initialSelectedGroups: { [key: string]: string[] } = {};
        parsedPermissions.forEach((permission: { group: string; items: string[] }) => {
          initialSelectedGroups[permission.group] = permission.items;
        });
        setPermissions(initialSelectedGroups);
      } catch (error) {
        console.error("Failed to fetch Role data:", error);
      }
    };

    fetchRoleData();
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
