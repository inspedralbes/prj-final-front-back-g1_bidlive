import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import LiveAuctionVideo from "./pages/LiveAuctionVideo";
import LiveAuctionPhoto from "./pages/LiveAuctionPhoto";
import Search from "./pages/Search";
import SellerDashboard from "./pages/SellerDashboard";
import CreateAuction from "./pages/CreateAuction";
import Profile from "./pages/Profile";
import Auctioneers from "./pages/Auctioneers";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TwoFactorAuth from "./pages/TwoFactorAuth";

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-2fa" element={<TwoFactorAuth />} />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Search />} />

              <Route path="/auction/video/:id" element={<LiveAuctionVideo />} />
              <Route path="/auction/photo/:id" element={<LiveAuctionPhoto />} />

              <Route path="/seller" element={<SellerDashboard />} />

              <Route path="/create-auction" element={<CreateAuction />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auctioneers" element={<Auctioneers />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
