import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/Search";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import LiveAuctionVideo from "./pages/LiveAuctionVideo";
import SellerDashboard from "./pages/SellerDashboard";
import CreatePuja from "./pages/CreatePuja";
import SellerLiveVideo from "./pages/SellerLiveVideo";
import Profile from "./pages/Profile";

import Messages from "./pages/Messages";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import NotificationToastManager from "./components/common/NotificationToastManager";

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <NotificationToastManager />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Search />} />
              <Route path="/auction/video/:id" element={<LiveAuctionVideo />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/seller/live/video/:id" element={<SellerLiveVideo />} />
              <Route path="/create-puja" element={<CreatePuja />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:id" element={<Messages />} />
            </Route>
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
