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

      // Logout functions
      const logoutUser = () => {
        console.log("Logging out user...");
        Cookie.remove("authToken");
        Cookie.remove("userId");
        Cookie.remove("userEmail");
        router.push("/login");
      };

      const inactivityDuration = 900000; // 15 minutes = 900000 ms
      const maxSessionDuration = 86400000 ; // 6 hours = 21600000 ms

      let inactivityTimeout = setTimeout(logoutUser, inactivityDuration);

      const sessionTimeout = setTimeout(() => {
        console.log("Maximum session timeout reached");
        logoutUser();
      }, maxSessionDuration);

      const resetInactivityTimeout = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(logoutUser, inactivityDuration);
      };

      window.addEventListener("mousemove", resetInactivityTimeout);
      window.addEventListener("keydown", resetInactivityTimeout);
      window.addEventListener("click", resetInactivityTimeout);

      return () => {
        clearTimeout(inactivityTimeout);
        clearTimeout(sessionTimeout);
        window.removeEventListener("mousemove", resetInactivityTimeout);
        window.removeEventListener("keydown", resetInactivityTimeout);
        window.removeEventListener("click", resetInactivityTimeout);
      };
    } else {
      router.push("/login");
    }
  }, [router]);

  return isAuthenticated;
};

export default useAuth;
