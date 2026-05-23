import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Simple white‑themed admin home page.
 * Mirrors the look of the regular user pages (white background, clean layout).
 */
const AdminDashboard = () => (
  <section className="min-h-screen bg-white flex items-center justify-center p-8">
    <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-6">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
        <ShieldCheck className="w-6 h-6 text-blue-600" /> Admin Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome to the admin section. Use the navigation bar on the left to manage KYC, products, users, and owners.
      </p>
    </div>
  </section>
);

export default AdminDashboard;
