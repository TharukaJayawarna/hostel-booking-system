import React, { useEffect, useState } from "react";
import hubService from "../../services/hub.service";
import floorService from "../../services/floor.service";
import roomService from "../../services/room.service";
import bedService from "../../services/bed.service";
import reservationService from "../../services/reservation.service";

import { useNotification } from "../../context/NotificationContext";
import {
  Building2,
  Layers,
  DoorOpen,
  BedDouble,
  CalendarDays,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Activity,
} from "lucide-react";
import "./styles/AdminDashboard.css";

const AdminDashboard = () => {
  const notify = useNotification();
  const [stats, setStats] = useState({
    totalHubs: 0,
    totalFloors: 0,
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0,
    bookedBeds: 0,
    activeReservations: 0,
    occupancyRate: 0,
    estimatedRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [hubsRes, floorsRes, roomsRes, bedsRes, resRes] = await Promise.all(
        [
          hubService.getAllHubs(),
          floorService.getAllFloors(),
          roomService.getAllRooms(),
          bedService.getAllBeds(),
          reservationService.getAllReservations(),
        ],
      );

      const hubs = hubsRes.data.data || [];
      const floors = floorsRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      const beds = bedsRes.data.data || [];
      const reservations = resRes.data.data || [];

      const bookedCount = beds.filter((bed) => bed.isBooked).length;
      const totalBedCount = beds.length;
      const availableCount = totalBedCount - bookedCount;
      const occupancy =
        totalBedCount > 0
          ? ((bookedCount / totalBedCount) * 100).toFixed(1)
          : 0;

      const activeReservationsList = reservations.filter(
        (r) => r.status === "APPROVED",
      );

      const revenueReservations = reservations.filter((r) =>
        ["APPROVED", "COMPLETED", "CANCELLED"].includes(r.status),
      );

      const bedsMap = new Map(beds.map((b) => [b.bedNumber, b]));
      const roomsMap = new Map(rooms.map((r) => [r.roomNumber, r]));

      let totalRevenue = 0;

      revenueReservations.forEach((res) => {
        const bed = bedsMap.get(res.bedNumber);
        if (bed) {
          const room = roomsMap.get(bed.roomNumber);
          if (room && room.monthlyPrice) {
            totalRevenue += room.monthlyPrice;
          }
        }
      });

      setStats({
        totalHubs: hubs.length,
        totalFloors: floors.length,
        totalRooms: rooms.length,
        totalBeds: totalBedCount,
        availableBeds: availableCount,
        bookedBeds: bookedCount,
        activeReservations: activeReservationsList.length,
        occupancyRate: occupancy,
        estimatedRevenue: totalRevenue,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      notify.error("Failed to load statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ad-loading">Loading Dashboard...</div>;

  return (
    <div className="ad-container">
      {/* 1. Header */}
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Dashboard Overview</h1>
          <p className="ad-subtitle">
            Welcome back! Here's what's happening at the hostel today.
          </p>
        </div>
        <div className="ad-date-badge">
          <CalendarDays size={16} />{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* 2. Main Metrics Grid */}
      <div className="ad-main-grid">
        {/* Revenue */}
        <div className="ad-main-card">
          <div className="ad-card-top">
            <div className="ad-icon-circle bg-blue">
              <DollarSign size={24} />
            </div>
            <div className="ad-bg-icon" style={{ color: "#2563eb" }}>
              <DollarSign size={40} />
            </div>
          </div>
          <div>
            <div className="ad-card-label">Est. Monthly Revenue</div>
            <div className="ad-card-value">
              LKR {(stats.estimatedRevenue / 1000).toFixed(1)}k
            </div>
            <div className="ad-card-trend trend-up">
              <TrendingUp size={14} /> +12% from last month
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="ad-main-card">
          <div className="ad-card-top">
            <div className="ad-icon-circle bg-green">
              <PieChart size={24} />
            </div>
            <div className="ad-bg-icon" style={{ color: "#16a34a" }}>
              <PieChart size={40} />
            </div>
          </div>
          <div>
            <div className="ad-card-label">Occupancy Rate</div>
            <div className="ad-card-value">{stats.occupancyRate}%</div>
            <div
              className={`ad-card-trend ${stats.occupancyRate > 50 ? "trend-up" : "trend-down"}`}
            >
              <Activity size={14} /> {stats.bookedBeds} beds occupied
            </div>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="ad-main-card">
          <div className="ad-card-top">
            <div className="ad-icon-circle bg-purple">
              <CalendarDays size={24} />
            </div>
            <div className="ad-bg-icon" style={{ color: "#7c3aed" }}>
              <CalendarDays size={40} />
            </div>
          </div>
          <div>
            <div className="ad-card-label">Active Reservations</div>
            <div className="ad-card-value">{stats.activeReservations}</div>
            <div className="ad-card-trend trend-neutral">
              Current active student bookings
            </div>
          </div>
        </div>

        {/* Available Beds */}
        <div className="ad-main-card">
          <div className="ad-card-top">
            <div className="ad-icon-circle bg-orange">
              <BedDouble size={24} />
            </div>
            <div className="ad-bg-icon" style={{ color: "#ea580c" }}>
              <BedDouble size={40} />
            </div>
          </div>
          <div>
            <div className="ad-card-label">Available Beds</div>
            <div className="ad-card-value">{stats.availableBeds}</div>
            <div className="ad-card-trend trend-neutral">
              Ready for new allocation
            </div>
          </div>
        </div>
      </div>

      {/* 3. Inventory Section */}
      <div>
        <div className="ad-section-title">
          <Building2 size={20} color="#4f46e5" /> Property Inventory
        </div>

        <div className="ad-inv-grid">
          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-blue">
              <Building2 size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Total Hubs</div>
              <div className="ad-inv-val">{stats.totalHubs}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-cyan">
              <Layers size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Total Floors</div>
              <div className="ad-inv-val">{stats.totalFloors}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-emerald">
              <DoorOpen size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Total Rooms</div>
              <div className="ad-inv-val">{stats.totalRooms}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-amber">
              <BedDouble size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Total Beds</div>
              <div className="ad-inv-val">{stats.totalBeds}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-red">
              <Users size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Capacity</div>
              <div className="ad-inv-val">
                {stats.totalBeds > 0 ? `${stats.totalBeds} Students` : "0"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
