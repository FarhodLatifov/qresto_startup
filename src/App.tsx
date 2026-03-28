/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GuestMenu from './pages/GuestMenu';
import LandingPage from './pages/LandingPage';
import ReservationPage from './pages/ReservationPage';
import { AdminLayout } from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import LoginPage from './pages/Login';
import MenuManager from './pages/admin/MenuManager';
import QrManager from './pages/admin/QrManager';
import Settings from './pages/admin/Settings';
import ReservationManager from './pages/admin/ReservationManager';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu/:slug/:tableId" element={<GuestMenu />} />
        <Route path="/reserve/:slug" element={<ReservationPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<ReservationManager />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="qr" element={<QrManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
