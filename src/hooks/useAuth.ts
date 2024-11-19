import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authToken = Cookie.get("authToken");

    if (authToken) {
      setIsAuthenticated(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  return isAuthenticated;
};

export default useAuth;
