import React from "react";
import { Outlet } from "react-router-dom";
// Sidebar එකේ නව path එක නිවැරදිව import කරන්න
import Sidebar from "../components/Sidebar";
// CSS ගොනුව import කරන්න
import "./styles/AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* 1. Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="admin-main">
        {/* Background Decoration */}
        <div className="admin-top-decor"></div>

        {/* Page Content (Outlet) */}
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
