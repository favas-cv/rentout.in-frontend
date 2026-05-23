import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';

/**
 * Admin layout – white themed, top navbar, no side panel.
 */
const AdminLayout = () => (
  <div className="min-h-screen bg-[#F8FAFC]">
    <AdminNavbar />
    <main className="max-w-7xl mx-auto px-6 py-8">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
