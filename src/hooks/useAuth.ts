import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authToken = Cookie.get("authToken");

    console.log("Auth Token:", authToken);

    if (authToken) {
      setIsAuthenticated(true);

      const timeout = setTimeout(() => {
        console.log("Timeout triggered - logging out");
        Cookie.remove("authToken");
        Cookie.remove("userId");
        Cookie.remove("userEmail");
        router.push("/login");
      }, 86400000);

      return () => clearTimeout(timeout);
    } else {
      console.log("No Auth Token - redirecting to login");
      router.push("/login");
    }
  }, [router]);

  return isAuthenticated;
};

export default useAuth;
