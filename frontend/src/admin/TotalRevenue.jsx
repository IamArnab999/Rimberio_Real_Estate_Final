import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const revenueSources = [
  {
    name: "Advertising",
    value: 40,
    details: [
      { name: "Sponsorships", value: 15 },
      { name: "Google Ads", value: 15 },
      { name: "Affiliate Ads", value: 10 },
    ],
  },
  {
    name: "Leads",
    value: 25,
    details: [
      { name: "Free Resource", value: 10 },
      { name: "Lead Selling", value: 15 },
    ],
  },
  {
    name: "Subscriptions",
    value: 20,
    details: [{ name: "Premium Membership", value: 20 }],
  },
  {
    name: "Commissions",
    value: 15,
    details: [{ name: "Transaction Commissions", value: 15 }],
  },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#6366F1",
  "#F87171",
];

const tabs = ["monthly", "quarterly", "yearly"];

export default function TotalRevenue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("yearly");
  const [ga4Data, setGa4Data] = useState({
    yearly: [],
    quarterly: [],
    monthly: [],
    loading: true,
    error: null,
  });

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

  // Prepare chart data for revenue
  const revenueData =
    ga4Data[activeTab]?.map((row) => ({
      name: row.month || row.quarter || "",
      revenue: row.revenue || 0,
    })) || [];

  // Helper to get AdSense revenue for the selected period
  const getAdsenseRevenue = () => {
    const data = ga4Data[activeTab] || [];
    // Sum AdSense revenue for the selected period
    return data.reduce((sum, row) => sum + (row.adsenseRevenue || 0), 0);
  };

  // Dynamically build revenueSources with real AdSense value
  const adsenseRevenue = getAdsenseRevenue();
  const dynamicRevenueSources = [
    {
      name: "Advertising",
      value: 40, // Keep as percentage for pie chart, or recalculate below
      details: [
        { name: "Sponsorships", value: 15 },
        { name: "Google Ads", value: adsenseRevenue },
        { name: "Affiliate Ads", value: 10 },
      ],
    },
    {
      name: "Leads",
      value: 25,
      details: [
        { name: "Free Resource", value: 10 },
        { name: "Lead Selling", value: 15 },
      ],
    },
    {
      name: "Subscriptions",
      value: 20,
      details: [{ name: "Premium Membership", value: 20 }],
    },
    {
      name: "Commissions",
      value: 15,
      details: [{ name: "Transaction Commissions", value: 15 }],
    },
  ];

  // For pie chart, recalculate main source percentages if you want to reflect real AdSense share
  // Example: sum all details, then set Advertising.value = sum(details.value)
  const advertisingTotal = dynamicRevenueSources[0].details.reduce(
    (a, b) => a + (b.value || 0),
    0
  );
  dynamicRevenueSources[0].value = advertisingTotal;

  // Flatten details for sub-pie
  const detailsData = dynamicRevenueSources.flatMap((src) =>
    src.details.map((d) => ({ ...d, parent: src.name }))
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6 md:p-10 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 mb-2 gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            Total Revenue Breakdown
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
          This page shows the total revenue for the selected period (if
          available from GA4).
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={revenueData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <RechartsLegend />
              <Bar dataKey="revenue" fill="#0EA5E9" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Revenue Sources Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-full max-w-md mx-auto md:max-w-none md:w-auto">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Revenue Sources
            </h2>
            <ResponsiveContainer
              width="100%"
              height={260}
              minWidth={200}
              minHeight={200}
            >
              <PieChart>
                <Pie
                  data={dynamicRevenueSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fontSize: 12 }}
                >
                  {dynamicRevenueSources.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Share"]}
                  wrapperStyle={{ fontSize: "14px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend for Revenue Sources */}
            <div className="w-full flex flex-wrap justify-center gap-2 mt-4">
              {dynamicRevenueSources.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center text-sm md:text-base"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="font-medium">{entry.name}:</span>
                  <span className="ml-1">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
          {/* Sub-categories Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center w-full max-w-md mx-auto md:max-w-none md:w-auto">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Breakdown by Method
            </h2>
            <ResponsiveContainer
              width="100%"
              height={260}
              minWidth={200}
              minHeight={200}
            >
              <PieChart>
                <Pie
                  data={detailsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fontSize: 12 }}
                >
                  {detailsData.map((entry, index) => (
                    <Cell
                      key={`cell-detail-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}%`,
                    props.payload.parent,
                  ]}
                  wrapperStyle={{ fontSize: "14px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend for Breakdown by Method */}
            <div className="w-full flex flex-wrap justify-center gap-2 mt-4">
              {detailsData.map((entry, index) => (
                <div
                  key={entry.name + index}
                  className="flex items-center text-sm md:text-base"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="font-medium">{entry.name}:</span>
                  <span className="ml-1">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
