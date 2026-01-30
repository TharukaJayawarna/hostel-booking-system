import React, { useEffect, useState } from "react";
import hubService from "../../services/hub.service";
import floorService from "../../services/floor.service";
import roomService from "../../services/room.service";
import bedService from "../../services/bed.service";
import reservationService from "../../services/reservation.service";
import userService from "../../services/user.service";
import settingsService from "../../services/settings.service";

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
  Shield,
  UserCheck,
  GraduationCap,
  Settings,
  Ban,
  Clock,
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

    hubBreakdown: [],

    totalUsers: 0,
    adminCount: 0,
    wardenCount: 0,
    studentCount: 0,

    maxBookingDays: 0,
    blockedDates: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        hubsRes,
        floorsRes,
        roomsRes,
        bedsRes,
        resRes,
        usersRes,
        settingsRes,
        blockedRes,
      ] = await Promise.all([
        hubService.getAllHubs(),
        floorService.getAllFloors(),
        roomService.getAllRooms(),
        bedService.getAllBeds(),
        reservationService.getAllReservations(),
        userService.getAllUsers(),
        settingsService.getMaxBookingDays(),
        settingsService.getBlockedDates(),
      ]);

      const hubs = hubsRes.data.data || [];
      const floors = floorsRes.data.data || [];
      const rooms = roomsRes.data.data || [];
      const beds = bedsRes.data.data || [];
      const reservations = resRes.data.data || [];
      const users = usersRes.data.data || [];
      const maxDays = settingsRes.data.data || 0;
      const blockedDates = blockedRes.data.data || [];

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

      const breakdown = hubs.map((hub) => ({
        id: hub.id,
        name: hub.hubNumber,
        floorCount: 0,
        roomCount: 0,
      }));

      const hubMap = {};
      breakdown.forEach((item) => {
        if (item.name) hubMap[item.name] = item;
      });

      floors.forEach((f) => {
        const hNum = f.hubNumber;
        if (hNum && hubMap[hNum]) hubMap[hNum].floorCount++;
      });

      rooms.forEach((r) => {
        const hNum = r.hubNumber;
        if (hNum && hubMap[hNum]) hubMap[hNum].roomCount++;
      });

      let adminC = 0,
        wardenC = 0,
        studentC = 0;
      users.forEach((u) => {
        const role = u.role ? u.role.toUpperCase() : "";
        if (role === "ADMIN") adminC++;
        else if (role === "WARDEN") wardenC++;
        else if (role === "STUDENT") studentC++;
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
        hubBreakdown: breakdown,

        totalUsers: users.length,
        adminCount: adminC,
        wardenCount: wardenC,
        studentCount: studentC,
        maxBookingDays: maxDays,
        blockedDates: blockedDates,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      notify.error("Failed to load dashboard data.");
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

      {/* 3. User Statistics Section */}
      <div className="mb-8">
        <div className="ad-section-title">
          <Users size={20} color="#4f46e5" /> User Statistics
        </div>
        <div className="ad-inv-grid">
          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-blue">
              <Users size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Total Users</div>
              <div className="ad-inv-val">{stats.totalUsers}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-purple">
              <Shield size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Administrators</div>
              <div className="ad-inv-val">{stats.adminCount}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-green">
              <UserCheck size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Wardens</div>
              <div className="ad-inv-val">{stats.wardenCount}</div>
            </div>
          </div>

          <div className="ad-inv-card">
            <div className="ad-inv-icon bg-cyan">
              <GraduationCap size={20} />
            </div>
            <div className="ad-inv-info">
              <div className="ad-inv-label">Students</div>
              <div className="ad-inv-val">{stats.studentCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. System & Inventory Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inventory */}
        <div>
          <div className="ad-section-title">
            <Building2 size={20} color="#4f46e5" /> Property Inventory
          </div>
          <div className="ad-inv-grid">
            {/* Hubs */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-blue">
                <Building2 size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Hubs</div>
                <div className="ad-inv-val">{stats.totalHubs}</div>
              </div>
            </div>

            {/* Floors */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-cyan">
                <Layers size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Floors</div>
                <div className="ad-inv-val">{stats.totalFloors}</div>
                <div className="ad-breakdown-list">
                  {stats.hubBreakdown.map((h) => (
                    <div key={h.id} className="ad-bd-item">
                      <span>{h.name}</span>
                      <span className="ad-bd-count">{h.floorCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-emerald">
                <DoorOpen size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Rooms</div>
                <div className="ad-inv-val">{stats.totalRooms}</div>
                <div className="ad-breakdown-list">
                  {stats.hubBreakdown.map((h) => (
                    <div key={h.id} className="ad-bd-item">
                      <span>{h.name}</span>
                      <span className="ad-bd-count">{h.roomCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Beds */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-amber">
                <BedDouble size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Total Beds</div>
                <div className="ad-inv-val">{stats.totalBeds}</div>
              </div>
            </div>

            {/* Capacity*/}
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

        {/* System Settings */}
        <div>
          <div className="ad-section-title">
            <Settings size={20} color="#4f46e5" /> System Overview
          </div>
          <div className="ad-inv-grid">
            {/* Max Booking Days */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-orange">
                <Clock size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Max Booking Duration</div>
                <div className="ad-inv-val">{stats.maxBookingDays} Days</div>
                <div className="text-xs text-gray-500 mt-1">
                  Per reservation
                </div>
              </div>
            </div>

            {/* Blocked Dates */}
            <div className="ad-inv-card">
              <div className="ad-inv-icon bg-red">
                <Ban size={20} />
              </div>
              <div className="ad-inv-info">
                <div className="ad-inv-label">Blocked Periods</div>

                {stats.blockedDates.length === 0 ? (
                  <div className="text-sm text-gray-400 mt-1 font-medium">
                    None
                  </div>
                ) : (
                  <div
                    className="ad-breakdown-list"
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {stats.blockedDates.map((date) => (
                      <div
                        key={date.id}
                        className="ad-bd-item"
                        style={{
                          backgroundColor: "#fef2f2",
                          borderColor: "#fee2e2",
                          color: "#b91c1c",
                          fontSize: "11px",
                          width: "100%",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {date.startDate}
                        </span>
                        <span style={{ margin: "0 4px", opacity: 0.6 }}>
                          to
                        </span>
                        <span style={{ fontWeight: 600 }}>{date.endDate}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
