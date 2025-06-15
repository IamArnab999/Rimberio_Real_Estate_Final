import React, { useState, useEffect, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";

const tabs = ["monthly", "quarterly", "yearly"];

export default function ClientConversions() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("yearly");
  const [ga4Data, setGa4Data] = useState({
    yearly: [],
    quarterly: [],
    monthly: [],
    loading: true,
    error: null,
  });
  // Review data state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  // Chat history state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    function fetchAnalytics() {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/analytics`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          setGa4Data({
            yearly: data.yearly || [],
            quarterly: data.quarterly || [],
            monthly: data.monthly || [],
            loading: false,
            error: null,
          });
        })
        .catch((err) => {
          if (!isMounted) return;
          setGa4Data((prev) => ({
            ...prev,
            loading: false,
            error: err.message || "Error fetching analytics",
          }));
        });
    }
    fetchAnalytics();
    const intervalId = setInterval(fetchAnalytics, 5000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Fetch reviews (from ReviewPage.jsx logic)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews`
        );
        if (!res.ok) throw new Error("Failed to fetch reviews");
        let data = await res.json();
        data = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setReviews(data);
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Fetch chat history (from ChatHistory.jsx logic)
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!user?.uid || !user?.role) return;
        // Try to use the same API as ChatHistory.jsx
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat-history?uid=${
            user.uid
          }&role=${user.role}`
        );
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        setChatHistory(data);
      } catch (err) {
        setChatHistory([]);
      } finally {
        setChatLoading(false);
      }
    };
    fetchChatHistory();
  }, [user]);

  // Prepare chart data for conversions and conversion rate
  const conversionsData =
    ga4Data[activeTab]?.map((row) => {
      // Determine the time key for grouping (month, quarter, or year)
      // Fix: Use correct keys for month/quarter/year for each tab
      let timeKey = "";
      let year = row.year;
      let month = null;
      let quarter = null;
      let quarterIdx = row.quarterIdx;
      if (activeTab === "monthly") {
        // Try to get month and year from row
        if (row.month && row.year) {
          month = row.month;
          year = row.year;
          timeKey = `${row.monthName || getMonthName(row.month)} ${row.year}`;
        } else if (row.month) {
          month = row.month;
          timeKey = row.month;
        } else if (row.name) {
          timeKey = row.name;
        }
      } else if (activeTab === "quarterly") {
        if (row.quarter && row.year) {
          quarter = row.quarter;
          year = row.year;
          timeKey = `Q${row.quarter} ${row.year}`;
        } else if (row.quarter) {
          quarter = row.quarter;
          timeKey = `Q${row.quarter}`;
        } else if (row.name) {
          timeKey = row.name;
        }
      } else if (activeTab === "yearly") {
        if (row.year) {
          year = row.year;
          timeKey = String(row.year);
        } else if (row.name) {
          timeKey = row.name;
        }
      }

      // Count reviews for this period
      let reviewCount = 0;
      if (activeTab === "monthly" && year && month) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;
      } else if (activeTab === "quarterly" && year && quarterIdx) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          const q = Math.floor(d.getMonth() / 3) + 1;
          return d.getFullYear() === year && q === quarterIdx;
        }).length;
      } else if (activeTab === "yearly" && year) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          return d.getFullYear() === year;
        }).length;
      }

      // Count chat events for this period
      let chatCount = 0;
      if (Array.isArray(chatHistory)) {
        if (activeTab === "monthly" && year && month) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          }).length;
        } else if (activeTab === "quarterly" && year && quarterIdx) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            const q = Math.floor(d.getMonth() / 3) + 1;
            return d.getFullYear() === year && q === quarterIdx;
          }).length;
        } else if (activeTab === "yearly" && year) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            return d.getFullYear() === year;
          }).length;
        }
      }

      // Combine GA4, reviews, and chat as conversions
      const totalConversions = (row.conversions || 0) + reviewCount + chatCount;
      return {
        name: timeKey,
        conversions: totalConversions,
        visitors: row.sessions || 0,
        rate:
          (row.sessions || 0) > 0
            ? Math.round((totalConversions / row.sessions) * 100)
            : 0,
      };
    }) || [];

  function getMonthName(monthNumber) {
    // 1-based month
    return (
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][monthNumber - 1] || String(monthNumber)
    );
  }

  console.log("[DEBUG] conversionsData", conversionsData, {
    reviews,
    chatHistory,
    ga4Data,
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header row: left title, right Back button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 mt-2 gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Client Conversions
          </h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
        <div className="w-full sm:w-[200px] mb-4">
          <div className="flex bg-gray-200 rounded overflow-hidden shadow">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-center text-xs sm:text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  activeTab === tab
                    ? "bg-white text-blue-700 shadow"
                    : "bg-gray-200 text-gray-500 hover:bg-blue-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-6 text-gray-700">
          This page shows monthly, quarterly, or yearly website visitors,
          conversion counts, and conversion rates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Conversions & Visitors
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={conversionsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="visitors" fill="#0EA5E9" name="Visitors" />
                <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Conversion Rate (%)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={conversionsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => v + "%"} />
                <Tooltip formatter={(v) => v + "%"} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="Conversion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
