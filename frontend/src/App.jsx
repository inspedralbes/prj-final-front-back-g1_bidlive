import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/Search";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import LiveAuctionVideo from "./pages/LiveAuctionVideo";
import SellerDashboard from "./pages/SellerDashboard";
import CreatePuja from "./pages/CreatePuja";
import SellerLiveVideo from "./pages/SellerLiveVideo";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Search />} />
            <Route path="/auction/video/:id" element={<LiveAuctionVideo />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/live/video/:id" element={<SellerLiveVideo />} />
            <Route path="/create-puja" element={<CreatePuja />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
