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
import CreatePuja from './pages/CreatePuja';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-2fa" element={<TwoFactorAuth />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/auction/video/:id" element={<LiveAuctionVideo />} />
            <Route path="/auction/photo/:id" element={<LiveAuctionPhoto />} />
            <Route path="/explore" element={<Search />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/create-puja" element={<CreatePuja />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
