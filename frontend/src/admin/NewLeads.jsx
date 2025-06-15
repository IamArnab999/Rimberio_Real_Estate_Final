import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#6366F1"];
const tabs = ["monthly", "quarterly", "yearly"];

export default function NewLeads() {
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

  // Prepare chart data for new leads
  const leadsData =
    ga4Data[activeTab]?.map((row) => ({
      name: row.month || row.quarter || "",
      leads: row.newUsers || 0,
    })) || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header row: left title, right Back button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            New Leads Overview
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
          This page shows the number of new leads generated for the selected
          period.
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">New Leads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={leadsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#10B981" name="New Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
