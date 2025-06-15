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
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CF6",
  "#FF6699",
  "#33CC99",
  "#FFCC00",
  "#FF6666",
  "#66CCFF",
  "#FFB347",
  "#B6D7A8",
];
const tabs = ["monthly", "quarterly", "yearly"];

export default function SalesCount() {
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

  // Prepare chart data for sales and leads
  const salesData =
    ga4Data[activeTab]?.map((row) => ({
      name: row.month || row.quarter || "",
      sales: row.sessions || 0,
      leads: row.newUsers || 0,
    })) || [];

  // Pie chart data for sales distribution
  const pieData = salesData.map((item) => ({
    name: item.name,
    value: item.sales,
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 space-y-6 animate-fade-in p-6 md:p-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
            Sales Count Details
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
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <h2 className="text-base md:text-lg font-medium mb-4">
            Monthly Sales Performance
          </h2>
          <div className="h-[220px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
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
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <h2 className="text-base md:text-lg font-medium mb-4">
            Sales Distribution by{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div className="h-[220px] md:h-[300px] flex items-center justify-center w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    color: "#000",
                  }}
                  formatter={(value) => [`${value} sales`, ""]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-medium mb-4">Raw Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-3 text-left text-gray-600">
                    {activeTab === "quarterly" ? "Quarter" : "Month"}
                  </th>
                  <th className="px-4 py-3 text-left text-gray-600">Sales</th>
                  <th className="px-4 py-3 text-left text-gray-600">Leads</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.sales}</td>
                    <td className="px-4 py-3">{row.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
