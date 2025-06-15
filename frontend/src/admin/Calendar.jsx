import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Video,
  Users,
  Plane,
  CakeSlice,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export function Calendar() {
  // Current date for the calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visitEvents, setVisitEvents] = useState([]);
  const [newsletterEvents, setNewsletterEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
        const [visitsRes, newsletterRes] = await Promise.all([
          fetch(`${backendUrl}/api/visits/all-calendar`),
          fetch(`${backendUrl}/api/newsletter/all-calendar`),
        ]);
        const visits = visitsRes.ok ? await visitsRes.json() : [];
        const newsletters = newsletterRes.ok ? await newsletterRes.json() : [];
        setVisitEvents(visits);
        setNewsletterEvents(newsletters);
      } catch (err) {
        setVisitEvents([]);
        setNewsletterEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Generate days for the calendar
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const daysInPreviousMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();
  const days = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: daysInPreviousMonth - i,
      isCurrentMonth: false,
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        daysInPreviousMonth - i
      ),
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday:
        new Date().getDate() === i &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear(),
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
    });
  }
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const nextMonthDays = totalCells - days.length;
  for (let i = 1; i <= nextMonthDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        i
      ),
    });
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Merge all events for calendar
  const allEvents = [
    ...visitEvents.map((v) => ({
      ...v,
      type: "visit",
      icon: <Video className="h-4 w-4" />, // You can customize icon per visit type
      eventDate: v.date,
      eventTime: v.time,
      userName: v.user_name,
      userAvatar: v.user_avatar,
      isGoogle: v.is_google,
      isGuest: v.is_guest,
    })),
    ...newsletterEvents.map((n) => ({
      ...n,
      type: "newsletter",
      icon: <Mail className="h-4 w-4" />,
      eventDate: n.date,
      userName: n.user_name || n.email,
      userAvatar: n.user_avatar,
      isGoogle: n.is_google,
      isGuest: n.is_guest,
    })),
  ];

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return allEvents.filter((event) => {
      if (!event.eventDate) return false;
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Event colors mapping
  const eventColors = {
    visit: "bg-teal-500",
    newsletter: "bg-blue-500",
  };

  // Modern calendar style
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="hidden md:block sm:col-span-1">
          <Sidebar />
        </div>
        <div className="sm:col-span-3 space-y-6 mt-11">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-blue-800 drop-shadow">
              Calendar
            </h1>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg hover:bg-blue-100 transition"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-6 w-6 text-blue-700" />
              </button>
              <div className="text-xl font-semibold text-blue-700">
                {currentMonth.toLocaleString("default", { month: "long" })}{" "}
                {currentMonth.getFullYear()}
              </div>
              <button
                className="p-2 rounded-lg hover:bg-blue-100 transition"
                onClick={nextMonth}
              >
                <ChevronRight className="h-6 w-6 text-blue-700" />
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-7 bg-blue-200/60 rounded-t-2xl">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-base font-semibold text-blue-700 tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-t border-blue-200">
              {days.map((day, index) => {
                const dayEvents = getEventsForDay(day.date);
                return (
                  <div
                    key={index}
                    className={`min-h-[110px] p-2 border-b border-r border-blue-100 relative group transition-all duration-200 ${
                      day.isCurrentMonth
                        ? "bg-white"
                        : "bg-blue-50 text-blue-200"
                    } ${
                      day.isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""
                    }`}
                  >
                    <div
                      className={`text-right text-base font-bold mb-1 ${
                        day.isToday
                          ? "bg-blue-600 text-white rounded-full w-7 h-7 ml-auto flex items-center justify-center shadow"
                          : ""
                      }`}
                    >
                      {day.day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event, idx) => (
                        <div
                          key={idx}
                          className={`${
                            eventColors[event.type]
                          } rounded-lg px-2 py-1 text-xs text-white flex items-center gap-1 shadow hover:scale-105 transition-transform cursor-pointer`}
                          title={
                            event.type === "visit"
                              ? `Visit by ${event.userName}`
                              : `Newsletter: ${event.userName}`
                          }
                        >
                          <span>{event.icon}</span>
                          <span className="truncate font-medium">
                            {event.type === "visit" ? "Visit" : "Newsletter"}
                          </span>
                          <span className="ml-1 truncate">
                            {event.userName}
                          </span>
                          {event.isGoogle && event.userAvatar && (
                            <img
                              src={event.userAvatar}
                              alt={event.userName}
                              className="w-5 h-5 rounded-full border-2 border-white ml-1"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Upcoming Events Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-2xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {allEvents
                .filter(
                  (e) => e.eventDate && new Date(e.eventDate) >= new Date()
                )
                .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                .slice(0, 5)
                .map((event, idx) => (
                  <div
                    key={idx}
                    className="flex items-center p-3 rounded-lg hover:bg-blue-100/60 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${
                        eventColors[event.type]
                      } flex items-center justify-center mr-4`}
                    >
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-blue-900">
                        {event.type === "visit" ? "Visit" : "Newsletter"} by{" "}
                        {event.userName}
                      </p>
                      <p className="text-xs text-blue-500">
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString()
                          : ""}
                        {event.eventTime ? ` at ${event.eventTime}` : ""}
                      </p>
                    </div>
                    {event.isGoogle && event.userAvatar && (
                      <img
                        src={event.userAvatar}
                        alt={event.userName}
                        className="w-7 h-7 rounded-full border-2 border-white"
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-blue-700 font-semibold text-lg flex items-center gap-2">
            Loading calendar events...
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
