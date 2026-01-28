import React from "react";
import { Outlet } from "react-router-dom";
// නිවැරදි කරන ලද Import Paths
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/Footer";
import "./styles/StudentLayout.css";

const StudentLayout = () => {
  return (
    <div className="student-layout">
      <Navbar />

      <main className="student-main">
        <div className="student-top-gradient"></div>
        <div className="student-content-wrapper">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentLayout;
