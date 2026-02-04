import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import {
  Search,
  DoorOpen,
  Users,
  BedDouble,
  CheckCircle2,
  MapPin,
  ArrowRight,
  CalendarDays,
  User,
  UserCheck,
  Clock,
  ArrowLeft,
  Layers,
  Loader2,
} from "lucide-react";

import { DateRange } from "react-date-range";
import {
  format,
  addDays,
  differenceInCalendarDays,
  parseISO,
  eachDayOfInterval,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./styles/FloorSelection.css";

import settingsService from "../../services/settings.service";
import roomService from "../../services/room.service";

const FloorSelection = () => {
  const notify = useNotification();
  const { hubId } = useParams();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const [openDate, setOpenDate] = useState(false);
  const calendarRef = useRef(null);

  const [rawRooms, setRawRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [maxBookingDays, setMaxBookingDays] = useState(90);
  const [disabledDates, setDisabledDates] = useState([]);

  const durationInDays = differenceInCalendarDays(
    dateRange[0].endDate,
    dateRange[0].startDate,
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [settingsRes, blockedRes] = await Promise.all([
          settingsService.getMaxBookingDays(),
          settingsService.getBlockedDates(),
        ]);

        if (settingsRes.data.status === "SUCCESS") {
          setMaxBookingDays(settingsRes.data.data);
        }

        if (blockedRes.data.status === "SUCCESS") {
          const blockedRanges = blockedRes.data.data;
          let allDisabled = [];
          blockedRanges.forEach((range) => {
            const dates = eachDayOfInterval({
              start: parseISO(range.startDate),
              end: parseISO(range.endDate),
            });
            allDisabled = [...allDisabled, ...dates];
          });
          setDisabledDates(allDisabled);
        }
      } catch (error) {
        console.error("Failed to load settings", error);
        notify.error("Failed to load system settings.");
      }
    };

    fetchInitialData();
  }, [notify]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpenDate(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickDuration = (days) => {
    const newEndDate = addDays(dateRange[0].startDate, days);
    setDateRange([
      {
        startDate: dateRange[0].startDate,
        endDate: newEndDate,
        key: "selection",
      },
    ]);
  };

  const handleSearch = async () => {
    // Validations
    if (durationInDays > maxBookingDays) {
      notify.error(`Maximum booking duration is ${maxBookingDays} days.`);
      return;
    }
    if (durationInDays <= 0) {
      notify.error("Invalid date range.");
      return;
    }

    const checkIn = format(dateRange[0].startDate, "yyyy-MM-dd");
    const checkOut = format(dateRange[0].endDate, "yyyy-MM-dd");

    setIsSearching(true);
    setSearched(true);
    setSelectedCategory(null);
    setRawRooms([]);

    try {
      const response = await roomService.checkAvailability(
        hubId,
        checkIn,
        checkOut,
      );

      if (response.data.status === "SUCCESS") {
        setRawRooms(response.data.data);
        if (response.data.data.length === 0) {
          notify.info(`No rooms available for ${durationInDays} days.`);
        }
      }
    } catch (error) {
      notify.error("Unable to find rooms. Please try different dates.");
    } finally {
      setIsSearching(false);
    }
  };

  const groupedData = useMemo(() => {
    let targetPeriod = "DAILY";
    if (durationInDays % 30 === 0) targetPeriod = "MONTHLY";
    else if (durationInDays % 7 === 0) targetPeriod = "WEEKLY";

    const filtered = rawRooms.filter((room) => {
      if (room.isPrivate) return false;
      if (targetPeriod === "MONTHLY") return true;
      return room.reservationPeriod === "DEFAULT";
    });

    return filtered.reduce((acc, room) => {
      const floor = room.floorNumber || "General Floor";
      const gender = room.reservedFor;

      if (!acc[floor]) {
        acc[floor] = { BOYS: [], GIRLS: [], totalCount: 0 };
      }

      if (gender === "BOYS") acc[floor].BOYS.push(room);
      else if (gender === "GIRLS") acc[floor].GIRLS.push(room);

      acc[floor].totalCount += 1;
      return acc;
    }, {});
  }, [rawRooms, durationInDays]);

  const handleRoomSelect = (room) => {
    navigate(`/rooms/${room.id}/beds`, {
      state: {
        checkIn: format(dateRange[0].startDate, "yyyy-MM-dd"),
        checkOut: format(dateRange[0].endDate, "yyyy-MM-dd"),
        reservedFor: room.reservedFor,
      },
    });
  };

  return (
    <div className="floor-selection-container">
      <div className="fs-inner-container">
        <div className="fs-header">
          <h1 className="fs-title">Check Availability</h1>
          <p className="fs-subtitle">
            Select your dates to find available accommodation.
          </p>
        </div>

        {/* Search Box */}
        <div className="fs-search-card" ref={calendarRef}>
          <div
            className="fs-date-display"
            onClick={() => setOpenDate(!openDate)}
            role="button"
            tabIndex={0}
          >
            <span className="fs-label">Check-in — Check-out</span>
            <div className="fs-date-value">
              <CalendarDays size={18} color="#4f46e5" />
              {`${format(dateRange[0].startDate, "MMM dd")} ➜ ${format(dateRange[0].endDate, "MMM dd, yyyy")}`}
              <div className="fs-duration-badge">
                <Clock size={12} /> {durationInDays} Days
              </div>
            </div>
          </div>

          {openDate && (
            <div className="fs-calendar-popup">
              <div className="fs-quick-select">
                <div className="fs-quick-title">Quick Select (Monthly)</div>
                <div className="fs-quick-btn-group">
                  {[30, 60, 90].map((days) => (
                    <button
                      key={days}
                      className={`fs-quick-btn ${durationInDays === days ? "active" : ""}`}
                      onClick={() => handleQuickDuration(days)}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
              <DateRange
                editableDateInputs={true}
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                minDate={new Date()}
                rangeColors={["#4f46e5"]}
                color="#4f46e5"
                disabledDates={disabledDates}
              />
              <div
                className={`fs-duration-display ${durationInDays > maxBookingDays ? "fs-duration-invalid" : "fs-duration-valid"}`}
              >
                {durationInDays} Nights Selected
              </div>
              <div className="fs-calendar-footer">
                <button
                  onClick={() => setOpenDate(false)}
                  className="fs-done-btn"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          <button
            className="fs-search-btn"
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isSearching ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Search size={18} />
            )}
            {isSearching ? "Checking..." : "Check Availability"}
          </button>
        </div>

        {/* --- RESULTS SECTION --- */}
        {searched && (
          <div className="fs-results-wrapper">
            {Object.keys(groupedData).length === 0 ? (
              <div className="fs-no-results">
                <div className="fs-empty-icon">
                  <CalendarDays size={30} color="#cbd5e1" />
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#475569",
                    marginBottom: "5px",
                  }}
                >
                  No Shared Rooms Available
                </h3>
                <p style={{ fontSize: "14px" }}>
                  Try changing your dates or explore other hubs.
                </p>
              </div>
            ) : (
              <>
                {!selectedCategory && (
                  <div style={{ width: "100%" }}>
                    {Object.entries(groupedData)

                      .sort((a, b) =>
                        a[0].localeCompare(b[0], undefined, { numeric: true }),
                      )
                      .map(([floorName, groups]) => {
                        if (
                          groups.BOYS.length === 0 &&
                          groups.GIRLS.length === 0
                        )
                          return null;

                        return (
                          <div key={floorName} className="fs-floor-row">
                            <div className="fs-floor-label">
                              <Layers size={18} /> {floorName}
                            </div>
                            <div className="fs-gender-grid">
                              {/* Boys Option */}
                              {groups.BOYS.length > 0 && (
                                <div
                                  className="fs-cat-card fs-cat-boys"
                                  onClick={() =>
                                    setSelectedCategory({
                                      floor: floorName,
                                      gender: "BOYS",
                                    })
                                  }
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="fs-cat-header">
                                    <div className="fs-cat-title">
                                      <User size={20} /> Boys Wing
                                    </div>
                                    <span className="fs-cat-badge badge-boys">
                                      Available
                                    </span>
                                  </div>
                                  <div className="fs-cat-stats">
                                    <DoorOpen size={16} /> {groups.BOYS.length}{" "}
                                    Rooms ({floorName})
                                  </div>
                                  <div className="fs-tap-hint">
                                    Tap to view rooms
                                  </div>
                                </div>
                              )}

                              {/* Girls Option */}
                              {groups.GIRLS.length > 0 && (
                                <div
                                  className="fs-cat-card fs-cat-girls"
                                  onClick={() =>
                                    setSelectedCategory({
                                      floor: floorName,
                                      gender: "GIRLS",
                                    })
                                  }
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="fs-cat-header">
                                    <div className="fs-cat-title">
                                      <UserCheck size={20} /> Girls Wing
                                    </div>
                                    <span className="fs-cat-badge badge-girls">
                                      Available
                                    </span>
                                  </div>
                                  <div className="fs-cat-stats">
                                    <DoorOpen size={16} /> {groups.GIRLS.length}{" "}
                                    Rooms ({floorName})
                                  </div>
                                  <div className="fs-tap-hint">
                                    Tap to view rooms
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {selectedCategory && (
                  <div style={{ width: "100%" }}>
                    <button
                      className="fs-back-link"
                      onClick={() => setSelectedCategory(null)}
                    >
                      <ArrowLeft size={16} /> Back to Floors
                    </button>

                    <div className="fs-category-title">
                      Available Rooms: {selectedCategory.floor} (
                      {selectedCategory.gender === "BOYS" ? "Boys" : "Girls"})
                    </div>

                    <div className="fs-rooms-grid">
                      {groupedData[selectedCategory.floor][
                        selectedCategory.gender
                      ].map((room) => (
                        <div
                          key={room.id}
                          className="fs-room-card"
                          onClick={() => handleRoomSelect(room)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="fs-room-number">
                            <DoorOpen size={20} color="#334155" />{" "}
                            {room.roomNumber}
                          </div>
                          <div className="fs-room-meta">
                            <div className="fs-meta-item">
                              <Users size={14} color="#64748b" /> 
                              {/* Room Type eka format karala ganna */}
                              {room.roomType 
                                ? `${room.roomType.replace("SHARING_", "")} Person Sharing` 
                                : "Shared Room"}
                            </div>
                            {/* Available Beds Count Eka */}
                            <div className="fs-meta-item" style={{ color: room.availableBeds > 0 ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                              <BedDouble size={14} /> 
                              {room.availableBeds} / {room.totalBeds} Beds Free
                            </div>
                          </div>
                          <div className="fs-price-tag">
                            <div>
                              <span className="fs-price-label">
                                Price ({room.reservationPeriod})
                              </span>
                              <div className="fs-price-value">
                                LKR{" "}
                                {room.reservationPeriod === "MONTHLY"
                                  ? parseFloat(
                                      room.monthlyPrice,
                                    ).toLocaleString()
                                  : parseFloat(
                                      room.dailyPrice || room.monthlyPrice,
                                    ).toLocaleString()}
                              </div>
                            </div>
                            <div className="fs-select-btn">
                              Select <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorSelection;
