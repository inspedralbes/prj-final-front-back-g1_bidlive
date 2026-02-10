import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LiveAuctionVideo from './pages/LiveAuctionVideo';
import LiveAuctionPhoto from './pages/LiveAuctionPhoto';
import Search from './pages/Search';
import SellerDashboard from './pages/SellerDashboard';
import CreateAuction from './pages/CreateAuction';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import TwoFactorAuth from './pages/TwoFactorAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auction/video/:id" element={<LiveAuctionVideo />} />
        <Route path="/auction/photo/:id" element={<LiveAuctionPhoto />} />
        <Route path="/explore" element={<Search />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-2fa" element={<TwoFactorAuth />} />
      </Routes>
    </Router>
  );
}

export default App;
