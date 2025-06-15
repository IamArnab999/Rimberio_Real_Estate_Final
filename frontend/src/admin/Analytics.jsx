import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { LineChart as LineChartIcon, TrendingUp, Users } from "lucide-react";
import Sidebar from "../components/Sidebar"; // Import Sidebar component
// import {Properties} from "../components/Properties"; // Import Properties component
import { useNavigate } from "react-router-dom";
import { initAnalytics } from "../firebase/analytics";

// Sample data for charts
const salesData = [
  { name: "Jan", sales: 4000, leads: 2400 },
  { name: "Feb", sales: 3000, leads: 1398 },
  { name: "Mar", sales: 2000, leads: 9800 },
  { name: "Apr", sales: 2780, leads: 3908 },
  { name: "May", sales: 1890, leads: 4800 },
  { name: "Jun", sales: 2390, leads: 3800 },
  { name: "Jul", sales: 3490, leads: 4300 },
  { name: "Aug", sales: 4000, leads: 2500 },
  { name: "Sep", sales: 3000, leads: 5500 },
  { name: "Oct", sales: 2000, leads: 4000 },
  { name: "Nov", sales: 2780, leads: 3300 },
  { name: "Dec", sales: 3890, leads: 4300 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF"];

const topAgents = [
  {
    id: "1",
    name: "Anirudha Basu Thakur",
    avatar:
      "https://lh3.googleusercontent.com/a/ACg8ocJVzZ4U9ScSPhpyJZf6fE3cG1KZ2FMcp_nW2izSS6vk-pwxXQ=s96-c",
    sales: 12,
    revenue: "₹10.02 Crore",
    performance: 85,
  },
  {
    id: "2",
    name: "Arnab Roy",
    avatar:
      "https://lh3.googleusercontent.com/a/ACg8ocLjnNs2jQlsCWlkqUiG4rrtvYI4cq7zvby-6lssGqwWkxoOjqLFOg=s96-c",
    sales: 10,
    revenue: "₹8.18 Crore",
    performance: 79,
  },
];

export default function Analytics() {
  const navigate = useNavigate();

  // Sidebar mobile state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Local state for tabs (using plain buttons for tab selection)
  const [activeTab, setActiveTab] = useState("yearly");
  const tabs = ["monthly", "quarterly", "yearly"];

  // --- GA4 Analytics State ---
  const [ga4Data, setGa4Data] = useState({
    yearly: { sales: [], leads: [], revenue: [], conversions: [], months: [] },
    quarterly: {
      sales: [],
      leads: [],
      revenue: [],
      conversions: [],
      quarters: [],
    },
    monthly: { sales: [], leads: [], revenue: [], conversions: [], months: [] },
    statCards: { yearly: {}, quarterly: {}, monthly: {} },
    loading: true,
    error: null,
  });

  // Fetch GA4 analytics from backend only once on mount (remove polling)
  useEffect(() => {
    let isMounted = true;
    function fetchAnalytics() {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/analytics`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          console.log("GA4 API Response:", data); // Debug: log backend response
          // Example GA4 backend response shape:
          // { monthly: [{month: 'Jan', activeUsers: 100, newUsers: 20, sessions: 50, conversions: 10, revenue: 10000}, ...], ... }
          // Map to chart and stat card data
          const yearly = data.yearly || [];
          const quarterly = data.quarterly || [];
          const monthly = data.monthly || [];

          // For sales chart: use sessions as sales, newUsers as leads, revenue, conversions
          const mapChart = (arr, labelKey) =>
            arr.map((row) => ({
              ...row, // Preserve all original fields (year, month, quarter, etc)
              name: row[labelKey],
              sales: row.sessions || 0,
              leads: row.newUsers || 0,
              revenue: row.revenue || 0,
              conversions: row.conversions || 0,
            }));

          // Stat cards: sum up for each period
          const sum = (arr, key) => arr.reduce((a, b) => a + (b[key] || 0), 0);
          const safePercent = (num, denom) =>
            denom > 0 ? Math.round((num / denom) * 100) : 0;

          const statCards = {
            yearly: {
              revenue: sum(yearly, "revenue"),
              sales: sum(yearly, "sessions"),
              leads: sum(yearly, "newUsers"),
              conversions: safePercent(
                sum(yearly, "conversions"),
                sum(yearly, "sessions")
              ),
            },
            quarterly: {
              revenue: sum(quarterly, "revenue"),
              sales: sum(quarterly, "sessions"),
              leads: sum(quarterly, "newUsers"),
              conversions: safePercent(
                sum(quarterly, "conversions"),
                sum(quarterly, "sessions")
              ),
            },
            monthly: {
              revenue: sum(monthly, "revenue"),
              sales: sum(monthly, "sessions"),
              leads: sum(monthly, "newUsers"),
              conversions: safePercent(
                sum(monthly, "conversions"),
                sum(monthly, "sessions")
              ),
            },
          };

          setGa4Data({
            yearly: mapChart(yearly, "month"),
            quarterly: mapChart(quarterly, "quarter").map((row, i) => ({
              ...row,
              quarterIdx: row.quarterIdx,
            })),
            monthly: mapChart(monthly, "month"),
            statCards,
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
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Client Conversion: Fetch reviews and chat for stat card ---
  const [reviews, setReviews] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null); // fallback if not using context

  // Fetch reviews
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, []);
  // Fetch chat history (all, for admin stat)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat-history?role=admin`)
      .then((res) => res.json())
      .then((data) => setChatHistory(Array.isArray(data) ? data : []))
      .catch(() => setChatHistory([]));
  }, []);

  // Helper to aggregate conversions for stat card (like ClientConversions.jsx)
  function getClientConversionPercent(tab) {
    const ga4Arr =
      tab === "yearly"
        ? ga4Data.yearly
        : tab === "quarterly"
        ? ga4Data.quarterly
        : ga4Data.monthly || [];
    let totalConversions = 0;
    let totalSessions = 0;
    const now = new Date();
    ga4Arr.forEach((row) => {
      let year = row.year;
      let month = row.monthIdx;
      let quarterIdx = row.quarterIdx; // Use numeric quarter index from backend
      // Reviews
      let reviewCount = 0;
      if (tab === "monthly" && year && month) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;
      } else if (tab === "quarterly" && year && quarterIdx) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          const q = Math.floor(d.getMonth() / 3) + 1;
          return d.getFullYear() === year && q === quarterIdx;
        }).length;
      } else if (tab === "yearly" && year) {
        reviewCount = reviews.filter((r) => {
          const d = new Date(r.created_at || r.date || r.timestamp);
          return d.getFullYear() === year;
        }).length;
      }
      // Chat
      let chatCount = 0;
      if (Array.isArray(chatHistory)) {
        if (tab === "monthly" && year && month) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          }).length;
        } else if (tab === "quarterly" && year && quarterIdx) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            const q = Math.floor(d.getMonth() / 3) + 1;
            return d.getFullYear() === year && q === quarterIdx;
          }).length;
        } else if (tab === "yearly" && year) {
          chatCount = chatHistory.filter((c) => {
            const d = new Date(c.created_at || c.timestamp || c.date);
            return d.getFullYear() === year;
          }).length;
        }
      }
      // Debug: log for each row
      console.log(
        `[${tab}] year:`,
        year,
        "month:",
        month,
        "quarterIdx:",
        quarterIdx,
        "row.sessions:",
        row.sessions,
        "row.conversions:",
        row.conversions,
        "reviewCount:",
        reviewCount,
        "chatCount:",
        chatCount
      );
      totalConversions += (row.conversions || 0) + reviewCount + chatCount;
      totalSessions += row.sessions || 0;
    });
    console.log(
      `[${tab}] totalConversions:`,
      totalConversions,
      "totalSessions:",
      totalSessions
    );
    return totalSessions > 0
      ? Math.round((totalConversions / totalSessions) * 100)
      : 0;
  }

  // --- Stat Card values from GA4 ---
  const statCardData = {
    yearly: [
      {
        title: "Total Revenue",
        value: ga4Data.loading
          ? "..."
          : `\u20B9${ga4Data.statCards.yearly.revenue?.toLocaleString() || 0}`,
        icon: React.createElement(
          "span",
          { style: { fontSize: 18 } },
          "\u20B9"
        ),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/TotalRevenue"),
      },
      {
        title: "Sales Count",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.yearly.sales || 0}`,
        icon: React.createElement(LineChartIcon, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/SalesCount"),
      },
      {
        title: "New Leads",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.yearly.leads || 0}`,
        icon: React.createElement(TrendingUp, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/NewLeads"),
      },
      {
        title: "Client Conversion",
        value: ga4Data.loading
          ? "..."
          : `${getClientConversionPercent("yearly")}%`,
        icon: React.createElement(Users, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/ClientConversions"),
      },
    ],
    quarterly: [
      {
        title: "Total Revenue",
        value: ga4Data.loading
          ? "..."
          : `\u20B9${
              ga4Data.statCards.quarterly.revenue?.toLocaleString() || 0
            }`,
        icon: React.createElement(
          "span",
          { style: { fontSize: 18 } },
          "\u20B9"
        ),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/TotalRevenue"),
      },
      {
        title: "Sales Count",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.quarterly.sales || 0}`,
        icon: React.createElement(LineChartIcon, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/SalesCount"),
      },
      {
        title: "New Leads",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.quarterly.leads || 0}`,
        icon: React.createElement(TrendingUp, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/NewLeads"),
      },
      {
        title: "Client Conversion",
        value: ga4Data.loading
          ? "..."
          : `${getClientConversionPercent("quarterly")}%`,
        icon: React.createElement(Users, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/ClientConversions"),
      },
    ],
    monthly: [
      {
        title: "Total Revenue",
        value: ga4Data.loading
          ? "..."
          : `\u20B9${ga4Data.statCards.monthly.revenue?.toLocaleString() || 0}`,
        icon: React.createElement(
          "span",
          { style: { fontSize: 18 } },
          "\u20B9"
        ),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/TotalRevenue"),
      },
      {
        title: "Sales Count",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.monthly.sales || 0}`,
        icon: React.createElement(LineChartIcon, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/SalesCount"),
      },
      {
        title: "New Leads",
        value: ga4Data.loading
          ? "..."
          : `${ga4Data.statCards.monthly.leads || 0}`,
        icon: React.createElement(TrendingUp, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/NewLeads"),
      },
      {
        title: "Client Conversion",
        value: ga4Data.loading
          ? "..."
          : `${getClientConversionPercent("monthly")}%`,
        icon: React.createElement(Users, { size: 18 }),
        trend: { direction: "up", value: "" },
        onClick: () => navigate("/admin/ClientConversions"),
      },
    ],
  };

  // --- Sales Chart Data from GA4 ---
  const salesDataByTab = {
    yearly: ga4Data.loading ? [] : ga4Data.yearly,
    quarterly: ga4Data.loading ? [] : ga4Data.quarterly,
    monthly: ga4Data.loading ? [] : ga4Data.monthly,
  };

  // Custom StatCard using plain JSX with white background and dark text
  // Make StatCard accept onClick and style props
  const StatCard = ({ title, value, icon, trend, onClick, style }) => (
    <div
      className="bg-white text-black rounded-lg shadow p-4 flex items-center justify-between hover:bg-blue-50 transition cursor-pointer"
      onClick={onClick}
      style={style}
    >
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
      <div className="flex flex-col items-center">
        {icon}
        <div
          className={`text-xs ${
            trend.direction === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value}
        </div>
      </div>
    </div>
  );

  // Custom Card component using plain JSX with white background and dark text
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white text-black rounded-lg shadow p-4 ${className}`}>
      {children}
    </div>
  );

  // Updated tooltip style for white cards
  const tooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    color: "#000000",
  };

  // State for property list
  const [propertyList, setPropertyList] = useState([]);

  // Fetch property data on mount and poll for real-time updates
  useEffect(() => {
    function fetchProperties() {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
        .then((res) => res.json())
        .then((data) => setPropertyList(Array.isArray(data) ? data : []))
        .catch(() => setPropertyList([]));
    }
    fetchProperties(); // initial fetch
    // Removed polling: do not setInterval here
    // const intervalId = setInterval(fetchProperties, 5000); // poll every 5 seconds
    // return () => clearInterval(intervalId);
  }, []);

  // Compute property type distribution (robust normalization)
  const typeLabels = ["For Sale", "For Rent", "Premium", "Sold"];
  const normalizeStatus = (status) => {
    if (!status) return "";
    let s = status.trim().toLowerCase();
    if (s.startsWith("for ")) s = s.replace("for ", "");
    return s;
  };
  const typeKeys = ["sale", "rent", "premium", "sold"];
  const typeCounts = typeKeys.map(
    (key) =>
      propertyList.filter((p) => normalizeStatus(p.status) === key).length
  );
  const total = typeCounts.reduce((a, b) => a + b, 0);
  const propertyTypeData = typeLabels.map((name, i) => ({
    name,
    value: total > 0 ? Math.round((typeCounts[i] / total) * 100) : 0,
    count: typeCounts[i],
  }));

  // State for Firebase Analytics instance
  const [analyticsInstance, setAnalyticsInstance] = useState(null);

  // Initialize Firebase Analytics using shared initAnalytics
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const analytics = await initAnalytics();
        if (mounted) setAnalyticsInstance(analytics);
        // if (analytics) {
        //   import("firebase/analytics")
        //     .then(({ logEvent }) => {
        //       if (typeof logEvent === "function") {
        //         logEvent(analytics, "page_view", {
        //           page_title: "Admin Analytics",
        //         });
        //       } else {
        //         console.warn("Firebase Analytics: logEvent is not a function");
        //       }
        //     })
        //     .catch((err) => {
        //       console.warn("Firebase Analytics: logEvent import failed", err);
        //     });
        // } else {
        //   console.warn(
        //     "Firebase Analytics: analytics not initialized or not supported"
        //   );
        // }
      } catch (err) {
        console.warn("Firebase Analytics: initAnalytics failed", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Log custom events when user clicks stat cards
  const handleStatCardClick = (card) => {
    if (analyticsInstance) {
      import("firebase/analytics")
        .then(({ logEvent }) => {
          // if (typeof logEvent === "function") {
          //   logEvent(analyticsInstance, "stat_card_click", {
          //     card_title: card.title,
          //     tab: activeTab,
          //   });
          // } else {
          //   console.warn("Firebase Analytics: logEvent is not a function");
          // }
        })
        .catch((err) => {
          console.warn("Firebase Analytics: logEvent import failed", err);
        });
    } else {
      console.warn("Firebase Analytics: analyticsInstance not available");
    }
    if (card.onClick) card.onClick();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Mobile menu button (three dots) - visible below 770px */}
      <button
        className="fixed top-4 left-4 z-30 flex flex-col items-center justify-center md:hidden w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 focus:outline-none"
        style={{ minWidth: 40, minHeight: 40 }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar menu"
      >
        <span
          className="block w-1 h-1 bg-gray-700 rounded-full mb-1"
          style={{ height: 6, width: 6 }}
        ></span>
        <span
          className="block w-1 h-1 bg-gray-700 rounded-full mb-1"
          style={{ height: 6, width: 6 }}
        ></span>
        <span
          className="block w-1 h-1 bg-gray-700 rounded-full"
          style={{ height: 6, width: 6 }}
        ></span>
      </button>

      {/* Sidebar - hidden on mobile, visible on md+ (770px+) */}
      <div className="hidden md:block w-full md:w-auto">
        <Sidebar />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>
          {/* Sidebar panel */}
          <div className="relative z-50 w-64 max-w-full h-full bg-white shadow-lg animate-slide-in-left">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ×
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6 lg:p-10 max-w-full md:max-w-7xl mx-auto w-full">
        {/* Header with title and custom tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
            Analytics
          </h1>
          <div className="w-full sm:w-[200px]">
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
        </div>

        {/* Stat Cards section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statCardData[activeTab].map((card, idx) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
              onClick={() => handleStatCardClick(card)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Sales Performance Card */}
          <Card className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-medium">
                Sales Performance
              </h2>
              <div className="text-xs text-gray-400">
                {activeTab === "yearly"
                  ? "Last 12 months"
                  : activeTab === "quarterly"
                  ? "Last 4 quarters"
                  : "Last 4 months"}
              </div>
            </div>
            <div className="h-[220px] xs:h-[260px] sm:h-[300px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesDataByTab[activeTab]}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Property Types Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-medium">
                Property Types
              </h2>
            </div>
            <div className="h-[220px] xs:h-[260px] sm:h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      ` ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(_, name, props) => {
                      // Find the correct entry by name, not by index
                      const entry = propertyTypeData.find(
                        (e) => e.name === name
                      );
                      const count = entry ? entry.count : 0;
                      return [`${count} properties`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4">
              <ul className="flex flex-wrap justify-center gap-2 sm:space-x-4">
                {propertyTypeData.map((entry, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 flex-col min-w-[70px]"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-xs sm:text-sm">
                      {entry.name}: {entry.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Top Performing Agents Table Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-medium">
              Top Performing Agents
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-600">
                    Agent
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-600">
                    Sales
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-600">
                    Revenue
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-600">
                    Performance
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="border-b border-gray-300 hover:bg-gray-100"
                  >
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3"
                        />
                        <span className="font-medium text-xs sm:text-sm">
                          {agent.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">{agent.sales}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-blue-600">
                      {agent.revenue}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-300 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${agent.performance}%` }}
                          />
                        </div>
                        <span className="text-xs">{agent.performance}%</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="px-2 py-1 text-xs rounded bg-green-200 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
