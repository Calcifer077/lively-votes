import { Outlet, Navigate } from "react-router";

import Navbar from "../components/Navbar";
// import { useAuth } from "../features/authentication/AuthContext";

function AppLayout() {
  // const { userId, userEmail } = useAuth();

  // if (!userId || !userEmail) {
  //   return <Navigate to="/signup" />;
  // }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AppLayout;
