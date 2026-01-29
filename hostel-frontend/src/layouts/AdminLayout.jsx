import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import "./styles/AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />

      <main className="admin-main">
        <div className="admin-top-decor"></div>

        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
