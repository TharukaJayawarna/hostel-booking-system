import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../services/auth.service";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();

  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
