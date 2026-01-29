import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  differenceInCalendarDays,
  isWithinInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  BedDouble,
  Search,
  Loader2,
  Info,
} from "lucide-react";
import "./styles/ReservationCalendar.css";

import bedService from "../../services/bed.service";
import reservationService from "../../services/reservation.service";

const CELL_WIDTH = 40;

const CalendarTooltip = ({ hoveredRes, position }) => {
  if (!hoveredRes) return null;

  const nights = differenceInCalendarDays(
    parseISO(hoveredRes.checkOut),
    parseISO(hoveredRes.checkIn),
  );

  return (
    <div className="rc-tooltip" style={{ top: position.y, left: position.x }}>
      <div className="rc-tooltip-header">
        <span>Reservation Details</span>
        <span
          className={`rc-status-badge ${hoveredRes.status === "PENDING" ? "status-pending" : "status-confirmed"}`}
        >
          {hoveredRes.status}
        </span>
      </div>

      <div className="rc-tooltip-row">
        <span className="rc-tt-label">Name</span>{" "}
        <span className="rc-tt-val">{hoveredRes.studentName}</span>
      </div>
      <div className="rc-tooltip-row">
        <span className="rc-tt-label">Reg No</span>{" "}
        <span className="rc-tt-val">{hoveredRes.studentRegNo || "-"}</span>
      </div>

      <div className="rc-tooltip-divider"></div>

      <div className="rc-tooltip-row">
        <span className="rc-tt-label">Check-in</span>
        <span className="rc-tt-val">{hoveredRes.checkIn}</span>
      </div>
      <div className="rc-tooltip-row">
        <span className="rc-tt-label">Check-out</span>
        <span className="rc-tt-val">{hoveredRes.checkOut}</span>
      </div>

      <div className="rc-tooltip-footer">
        <Clock size={14} />
        {nights} Nights Stay
      </div>
    </div>
  );
};

const ReservationCalendar = () => {
  const notify = useNotification();

  const [beds, setBeds] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRes, setHoveredRes] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const sidebarRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bedsRes, resRes] = await Promise.all([
        bedService.getAllBeds(),
        reservationService.getAllReservations(),
      ]);

      if (bedsRes.data.status === "SUCCESS") {
        const sortedBeds = bedsRes.data.data.sort(
          (a, b) =>
            a.roomNumber.localeCompare(b.roomNumber) ||
            a.bedNumber.localeCompare(b.bedNumber),
        );
        setBeds(sortedBeds);
      }
      if (resRes.data.status === "SUCCESS") {
        setReservations(resRes.data.data);
      }
    } catch (error) {
      notify.error("Failed to load calendar data.");
    } finally {
      setLoading(false);
    }
  };

  const reservationsMap = useMemo(() => {
    const map = {};
    reservations.forEach((res) => {
      if (!map[res.bedNumber]) {
        map[res.bedNumber] = [];
      }
      map[res.bedNumber].push(res);
    });
    return map;
  }, [reservations]);

  const filteredBeds = useMemo(() => {
    return beds.filter(
      (bed) =>
        bed.roomNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );
  }, [beds, searchTerm]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleMouseEnter = (e, res) => {
    const { clientX, clientY } = e;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const tooltipWidth = 300;
    const tooltipHeight = 220;

    let xPos = clientX + 20;
    if (clientX + tooltipWidth > screenWidth) {
      xPos = clientX - tooltipWidth - 20;
    }

    let yPos = clientY + 20;
    if (clientY + tooltipHeight > screenHeight) {
      yPos = clientY - tooltipHeight - 20;
    }

    setHoveredRes(res);
    setCursorPos({ x: xPos, y: yPos });
  };

  const handleMouseMove = (e) => {
    if (hoveredRes) {
      const { clientX, clientY } = e;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const tooltipWidth = 300;
      const tooltipHeight = 220;

      let xPos = clientX + 20;
      if (clientX + tooltipWidth > screenWidth) {
        xPos = clientX - tooltipWidth - 20;
      }

      let yPos = clientY + 20;
      if (clientY + tooltipHeight > screenHeight) {
        yPos = clientY - tooltipHeight - 20;
      }

      setCursorPos({ x: xPos, y: yPos });
    }
  };

  const handleMouseLeave = () => {
    setHoveredRes(null);
  };

  const handleScroll = (e) => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const getVisibleReservations = (bedNumber) => {
    const bedResList = reservationsMap[bedNumber] || [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    return bedResList.filter((res) => {
      const resStart = parseISO(res.checkIn);
      const resEnd = parseISO(res.checkOut);

      return resStart <= monthEnd && resEnd >= monthStart;
    });
  };

  if (loading) {
    return (
      <div className="rc-loading-container">
        <Loader2 className="animate-spin" size={40} color="#3b82f6" />
        <p>Loading Calendar...</p>
      </div>
    );
  }

  return (
    <div className="rc-container">
      {/* 1. HEADER */}
      <div className="rc-header">
        <div className="rc-header-left">
          <div className="rc-title-icon">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="rc-month-title">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="rc-sub-title">Booking Overview & Timeline</div>
          </div>
        </div>

        <div className="rc-controls-wrapper">
          <div className="rc-search-box">
            <Search size={18} color="#94a3b8" />
            <input
              className="rc-search-input"
              placeholder="Search Room or Bed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rc-nav-group">
            <button
              className="rc-nav-btn"
              onClick={prevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>
            <button className="rc-today-btn" onClick={goToToday}>
              Today
            </button>
            <button
              className="rc-nav-btn"
              onClick={nextMonth}
              title="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR GRID */}
      <div className="rc-content">
        {/* Left Sidebar */}
        <div className="rc-sidebar" ref={sidebarRef}>
          <div className="rc-sidebar-header">
            <span style={{ fontWeight: 700 }}>Accommodation Unit</span>
          </div>
          {filteredBeds.map((bed) => (
            <div key={bed.id} className="rc-sidebar-row">
              <div className="rc-room-text">{bed.roomNumber}</div>
              <div className="rc-bed-text">
                <BedDouble size={14} /> {bed.bedNumber}
              </div>
            </div>
          ))}
          {filteredBeds.length === 0 && (
            <div
              style={{
                padding: "20px",
                fontSize: "12px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              No beds found
            </div>
          )}
        </div>

        {/* Right Timeline */}
        <div className="rc-timeline" ref={timelineRef} onScroll={handleScroll}>
          <div style={{ width: `${daysInMonth.length * CELL_WIDTH}px` }}>
            {/* Days Header */}
            <div className="rc-timeline-header">
              {daysInMonth.map((day) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toString()}
                    className={`rc-day-cell ${isToday ? "today" : ""}`}
                    style={{ width: `${CELL_WIDTH}px` }}
                  >
                    <span className="rc-day-name">{format(day, "EEE")}</span>
                    <span className="rc-day-num">{format(day, "d")}</span>
                  </div>
                );
              })}
            </div>

            {/* Grid Body */}
            <div className="rc-grid-body">
              {filteredBeds.map((bed) => {
                const bedRes = getVisibleReservations(bed.bedNumber);

                return (
                  <div key={bed.id} className="rc-grid-row">
                    {/* Empty Grid Cells for Lines */}
                    {daysInMonth.map((_, i) => (
                      <div
                        key={i}
                        className="rc-grid-cell-bg"
                        style={{
                          width: `${CELL_WIDTH}px`,
                          left: `${i * CELL_WIDTH}px`,
                        }}
                      ></div>
                    ))}

                    {bedRes.map((res) => {
                      const resStart = parseISO(res.checkIn);
                      const resEnd = parseISO(res.checkOut);
                      const monthStart = startOfMonth(currentDate);

                      let startIndex = differenceInCalendarDays(
                        resStart,
                        monthStart,
                      );

                      if (startIndex < 0) startIndex = 0;

                      const endOfView =
                        endOfMonth(currentDate) < resEnd
                          ? endOfMonth(currentDate)
                          : resEnd;
                      const startOfView =
                        resStart < monthStart ? monthStart : resStart;

                      const duration =
                        differenceInCalendarDays(endOfView, startOfView) + 1;

                      if (duration <= 0) return null;

                      const statusClass =
                        res.status === "PENDING" ? "pending" : "confirmed";
                      const hoverClass =
                        hoveredRes?.id === res.id ? "hovered" : "";

                      return (
                        <div
                          key={res.id}
                          className={`rc-res-pill ${statusClass} ${hoverClass}`}
                          style={{
                            left: `${startIndex * CELL_WIDTH + 4}px`,
                            width: `${duration * CELL_WIDTH - 8}px`,
                          }}
                          onMouseEnter={(e) => handleMouseEnter(e, res)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                        >
                          <User size={12} className="rc-user-icon" />
                          <span className="rc-user-name">
                            {res.studentName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOOLTIP  */}
      <CalendarTooltip hoveredRes={hoveredRes} position={cursorPos} />
    </div>
  );
};

export default ReservationCalendar;
