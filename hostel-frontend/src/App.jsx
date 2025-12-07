import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';


// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout'; 

// Student Pages
import Home from './pages/student/Home';
import FloorSelection from './pages/student/FloorSelection';
import BedSelection from './pages/student/BedSelection';
import Reservation from './pages/student/Reservation'; 
import PaymentSuccess from './pages/student/PaymentSuccess';
import PaymentCancel from './pages/student/PaymentCancel';

// Admin Pages (Comment these out for now)
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRooms from './pages/admin/ManageRooms';
import ManageReservations from './pages/admin/ManageReservations';
import ManageHubs from './pages/admin/ManageHubs';
import ManageFloors from './pages/admin/ManageFloors';
import ManageBeds from './pages/admin/ManageBeds';
import BookingSuccess from './pages/student/BookingSuccess';
import IssueForm from './pages/student/IssueForm';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        
        {/* === STUDENT SIDE === */}
        <Route path="/" element={<StudentLayout />}>
          <Route index element={<Home />} />
          <Route path="hubs/:hubId/floors" element={<FloorSelection />} /> 
          <Route path="rooms/:roomId/beds" element={<BedSelection />} />
          <Route path="reserve" element={<Reservation />} /> 
          <Route path="booking-success" element={<BookingSuccess />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-cancel" element={<PaymentCancel />} />
          <Route path="issue" element={<IssueForm />} />
        </Route>

        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="reservations" element={<ManageReservations />} />
          <Route path="hubs" element={<ManageHubs />} />
          <Route path="floors" element={<ManageFloors />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="beds" element={<ManageBeds />} />
        </Route> 
       

      </Routes>
    </Router>
  );
}

export default App;