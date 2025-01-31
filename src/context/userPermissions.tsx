/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { getWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useUserContext } from "./userContext";

const PermissionsContext = createContext<{ [key: string]: string[] }>({});

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<{ [key: string]: string[] }>({});
  const { userId, userType } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!userId || userType === "super_admin") return;

    const fetchRoleData = async () => {
      try {
        const response = await getWithAuth(`user-permissions/${userId}`);

        if (response?.status === "fail") {
          router.push("/unauthorized");
          return;
        }

        const parsedPermissions = JSON.parse(response || "[]");
        const initialSelectedGroups: { [key: string]: string[] } = {};
        parsedPermissions.forEach((permission: { group: string; items: string[] }) => {
          initialSelectedGroups[permission.group] = permission.items;
        });

        setPermissions(initialSelectedGroups);
      } catch (error) {
        console.error("Failed to fetch Role data:", error);
        router.push("/unauthorized");
      }
    };

    fetchRoleData();
  }, [userId, userType, router]);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
