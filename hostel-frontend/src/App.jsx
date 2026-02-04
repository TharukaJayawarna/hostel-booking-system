import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { NotificationProvider } from "./context/NotificationContext";
import SecuritySettings from "./pages/common/SecuritySettings";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Student Pages
import Home from "./pages/student/Home";
import FloorSelection from "./pages/student/FloorSelection";
import BedSelection from "./pages/student/BedSelection";
import Reservation from "./pages/student/Reservation";
import PaymentSuccess from "./pages/student/PaymentSuccess";
import PaymentCancel from "./pages/student/PaymentCancel";
import Contact from "./pages/student/Contact";
import BookingSuccess from "./pages/student/BookingSuccess";
import IssueForm from "./pages/student/IssueForm";
import MyBookings from "./pages/student/MyBookings";
import NotificationsPage from "./pages/student/NotificationsPage";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageRooms from "./pages/admin/ManageRooms";
import ManageReservations from "./pages/admin/ManageReservations";
import ManageHubs from "./pages/admin/ManageHubs";
import ManageFloors from "./pages/admin/ManageFloors";
import ManageBeds from "./pages/admin/ManageBeds";
import ReservationCalendar from "./pages/admin/ReservationCalendar";
import ManageUsers from "./pages/admin/ManageUsers";
import SystemSettings from "./pages/admin/SystemSettings";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* === STUDENT ROUTES === */}
          <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
            <Route path="/" element={<StudentLayout />}>
              <Route index element={<Home />} />
              <Route path="hubs/:hubId/floors" element={<FloorSelection />} />
              <Route path="rooms/:roomId/beds" element={<BedSelection />} />
              <Route path="reserve" element={<Reservation />} />
              <Route path="booking-success" element={<BookingSuccess />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="payment-cancel" element={<PaymentCancel />} />
              <Route path="issue" element={<IssueForm />} />
              <Route path="contact" element={<Contact />} />
              <Route path="my-bookings" element={<MyBookings />} />
              <Route path="security" element={<SecuritySettings />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* === ADMIN & WARDEN ROUTES === */}
          <Route
            element={<ProtectedRoute allowedRoles={["ADMIN", "WARDEN"]} />}
          >
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="hubs" element={<ManageHubs />} />
              <Route path="floors" element={<ManageFloors />} />
              <Route path="rooms" element={<ManageRooms />} />
              <Route path="beds" element={<ManageBeds />} />
              <Route path="reservations" element={<ManageReservations />} />
              <Route path="calendar" element={<ReservationCalendar />} />
              <Route path="security" element={<SecuritySettings />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="settings" element={<SystemSettings />} />{" "}
              <Route path="users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
