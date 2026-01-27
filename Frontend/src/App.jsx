import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import AllPolls from "./components/AllPolls";
import CreatePoll from "./components/CreatePoll";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AppLayout from "./pages/AppLayout";
import ProfilePage from "./pages/ProfilePage";

import { AuthProvider } from "./context/AuthContext";

import { socket } from "./features/socket/socket";
import { useSocketInvalidation } from "./features/socket/useSocketInvalidation";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    socket.connect();

    return () => socket.disconnect();
  }, []);

  return (
    <>
      <div className="min-h-screen w-full relative bg-white">
        {/* Purple Glow Top */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#ffffff",
            backgroundImage: `
            radial-gradient(
              circle at top center,
              rgba(173, 109, 244, 0.5),
              transparent 70%
            )
          `,
            filter: "blur(80px)",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10">
          <QueryClientProvider client={queryClient}>
            <SocketQueryInvalidation />

            {/* Change below to create browser router */}
            <BrowserRouter>
              {/* For Authentication */}
              <AuthProvider>
                <Routes>
                  {/* <Route path="login" element={<LoginPage />} /> */}
                  {/* <Route path="signup" element={<SignupPage />} /> */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<AllPolls />} />
                    <Route path="/createPoll" element={<CreatePoll />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Routes>
              </AuthProvider>
            </BrowserRouter>

            <Toaster />

            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </div>
      </div>
    </>
  );
}

function SocketQueryInvalidation() {
  useSocketInvalidation();

  return null;
}
