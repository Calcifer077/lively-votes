import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";

import Navbar from "../components/Navbar";
import { useAuthContext } from "../context/AuthContext";

function AppLayout() {
  const { userId, jwt, email } = useAuthContext();

  const navigate = useNavigate();

  const isAuthenticated = Boolean(userId && jwt && email);

  useEffect(() => {
    // Redirect to signup if not authenticated
    if (!isAuthenticated) {
      navigate("/signup");
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
