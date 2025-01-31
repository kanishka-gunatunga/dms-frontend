"use client";
import { usePermissions } from "@/context/userPermissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const withPermission = <P extends object>(
  Component: React.FC<P>,
  requiredPermission: { group: string; action: string }
) => {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const permissions = usePermissions();
    const [isLoaded, setIsLoaded] = useState(false);

    const hasPermission = (group: string, action: string) => {
      return permissions && permissions[group]?.includes(action);
    };

    useEffect(() => {
      if (permissions && Object.keys(permissions).length > 0) {
        setIsLoaded(true);
        if (!hasPermission(requiredPermission.group, requiredPermission.action)) {
          router.replace("/");
        }
      }
    }, [permissions, router]);


    if (!isLoaded) {
      return <LoadingSpinner />
    }

    return hasPermission(requiredPermission.group, requiredPermission.action) ? (
      <Component {...props} />
    ) : null;
  };
};

export default withPermission;
