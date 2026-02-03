import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";

import Navbar from "../components/Navbar";
import { useAuthContext } from "../context/AuthContext";

function AppLayout() {
  const { userId, jwt, email } = useAuthContext();

  const navigate = useNavigate();

  const isAuthenticated = Boolean(userId && jwt && email);

  useEffect(() => {
    if (!isAuthenticated) {
      // Only redirect if we're NOT already on an auth page
      if (
        !location.pathname.startsWith("/signup") &&
        !location.pathname.startsWith("/login")
      ) {
        navigate("/signup", { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AppLayout;
