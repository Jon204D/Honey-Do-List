import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const isSessionValid = () => {
  const loggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!loggedIn) return false;
  const expiry = Number(localStorage.getItem("sessionExpiry") || 0);
  return !expiry || Date.now() < expiry;
};

export const useSession = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(isSessionValid());
  const location = useLocation();

  const refresh = () => setIsLoggedIn(isSessionValid());

  useEffect(() => {
    const onSession = () => refresh();
    window.addEventListener("sessionchange", onSession);      // fired by login/logout
    document.addEventListener("visibilitychange", onSession); // when tab refocuses
    window.addEventListener("storage", onSession);            // other tabs
    return () => {
      window.removeEventListener("sessionchange", onSession);
      document.removeEventListener("visibilitychange", onSession);
      window.removeEventListener("storage", onSession);
    };
  }, []);

  // Safety net: recompute whenever the route changes
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return isLoggedIn;
};