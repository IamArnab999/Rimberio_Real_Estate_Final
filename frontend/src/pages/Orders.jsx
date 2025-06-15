import React, { useState } from "react";
import Sidebar from "../components/Sidebar"; // Ensure the file path and case match your project

const orders = [
  {
    id: "ORD-1234",
    date: "2025-04-05",
    status: "Delivered",
    total: 125.99,
    items: 3,
    shipping: "Express"
  },
  {
    id: "ORD-1235",
    date: "2025-04-04",
    status: "Processing",
    total: 89.50,
    items: 2,
    shipping: "Standard"
  },
  {
    id: "ORD-1236",
    date: "2025-04-03",
    status: "Shipped",
    total: 212.75,
    items: 4,
    shipping: "Express"
  },
  {
    id: "ORD-1237",
    date: "2025-04-02",
    status: "Cancelled",
    total: 45.00,
    items: 1,
    shipping: "Standard"
  },
  {
    id: "ORD-1238",
    date: "2025-04-01",
    status: "Delivered",
    total: 159.99,
    items: 2,
    shipping: "Express"
  },
  {
    id: "ORD-1239",
    date: "2025-03-31",
    status: "Returned",
    total: 79.99,
    items: 1,
    shipping: "Standard"
  },
  {
    id: "ORD-1240",
    date: "2025-03-30",
    status: "Delivered",
    total: 345.50,
    items: 5,
    shipping: "Express"
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Returned":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Orders() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Orders Content */}
      <div className="flex-1 space-y-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="mt-12 text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600 mt-1">View and manage your order history</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 rounded px-4 py-2 text-base flex items-center">
              <span className="mr-2">↻</span>
              Refresh
            </button>
            <button className="border border-gray-300 rounded px-4 py-2 text-base flex items-center">
              <span className="mr-2">⤓</span>
              Export
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="border rounded shadow">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-semibold">Order History</h2>
            <div className="w-full md:w-64">
              <input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border text-left">Order ID</th>
                  <th className="px-4 py-2 border text-left">Date</th>
                  <th className="px-4 py-2 border text-left">Status</th>
                  <th className="px-4 py-2 border text-left hidden md:table-cell">Items</th>
                  <th className="px-4 py-2 border text-right">Total</th>
                  <th className="px-4 py-2 border text-left hidden md:table-cell">Shipping</th>
                  <th className="px-4 py-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border font-medium">{order.id}</td>
                      <td className="px-4 py-2 border">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 border">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border hidden md:table-cell">{order.items}</td>
                      <td className="px-4 py-2 border text-right">₹{order.total.toFixed(2)}</td>
                      <td className="px-4 py-2 border hidden md:table-cell">{order.shipping}</td>
                      <td className="px-4 py-2 border text-center">
                        <select defaultValue="" className="border rounded px-2 py-1 text-sm">
                          <option value="" disabled>
                            Actions
                          </option>
                          <option value="view">View details</option>
                          <option value="download">Download invoice</option>
                          {(order.status !== "Delivered" && order.status !== "Cancelled") && (
                            <option value="cancel">Cancel order</option>
                          )}
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="h-24 text-center">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;