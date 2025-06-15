import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import Sidebar from "../components/Sidebar";// Ensure the file path and case match your project
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getStatusColor = (status) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800";
    case "Sold Out":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
// --- Modal Component (same style as Clients.jsx) ---
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
function formatINR(amount) {
  // Remove any non-digit or decimal characters
  const num = Number(String(amount).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return "₹ 0.00";
  return (
    "₹ " +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
export function Wishlist() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch wishlist from backend on mount
  useEffect(() => {
    // Fetch all properties to check for sold status
    let allProperties = [];
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
      .then((res) => res.json())
      .then((properties) => {
        allProperties = Array.isArray(properties) ? properties : [];
        return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`);
      })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Remove wishlist items that are sold
          const filtered = data.filter((item) => {
            const prop = allProperties.find(
              (p) => String(p.property_id || p.id) === String(item.property_id)
            );
            return (
              !prop || (prop.status && prop.status.toLowerCase() !== "sold")
            );
          });
          setWishlistItems(filtered);
          // Optionally, remove sold items from backend wishlist as well
          data.forEach((item) => {
            const prop = allProperties.find(
              (p) => String(p.property_id || p.id) === String(item.property_id)
            );
            if (prop && prop.status && prop.status.toLowerCase() === "sold") {
              fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/${
                  item.property_id
                }`,
                { method: "DELETE" }
              );
            }
          });
        } else {
          setWishlistItems([]);
        }
      })
      .catch(() => {
        setWishlistItems([]);
        toast.error("Failed to fetch wishlist.");
      });
  }, []);
  // Remove handler
  const handleRemove = async (property_id) => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/${property_id}`,
        {
          method: "DELETE",
        }
      );
      setWishlistItems((prev) =>
        prev.filter((item) => item.property_id !== property_id)
      );
      setShowRemoveModal(false);
      setSelectedItem(null);
      toast.success("Removed from wishlist.");
    } catch (err) {
      toast.error("Failed to remove from wishlist.");
    }
  };

  // View Details handler
  const handleViewDetails = (property_id) => {
    setShowViewModal(false);
    setSelectedItem(null);
    toast.info("Redirecting to property details...");
    navigate("/see_more", { state: { property_id } });
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (wishlistItems.length === 0) {
      toast.warn("No items to export.");
      setShowExportDropdown(false);
      return;
    }
    const dataStr = JSON.stringify(wishlistItems, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wishlist.json";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
    toast.success("Wishlist exported as JSON.");
  };

  // Export as PDF
  const handleExportPDF = () => {
    if (wishlistItems.length === 0) {
      toast.warn("No items to export.");
      setShowExportDropdown(false);
      return;
    }
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Property ID", "Property Name", "Location", "Price", "Status"]],
      body: wishlistItems.map((item) => [
        item.property_id,
        item.property_name,
        item.location,
        // Replace ₹ with Rs. in the formatted price
        formatINR(item.price).replace(/^₹\s?/, "Rs. "),
        item.status,
      ]),
    });
    doc.save("wishlist.pdf");
    setShowExportDropdown(false);
    toast.success("Wishlist exported as PDF.");
  };

  // Remove all wishlist items
  const handleDeleteAllWishlist = async () => {
    if (!window.confirm("Are you sure you want to delete ALL wishlist items?"))
      return;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
        method: "DELETE",
      });
      setWishlistItems([]);
      toast.success("All wishlist items deleted!");
    } catch (err) {
      toast.error("Failed to delete all wishlist items.");
    }
  };

  const filteredWishlist = wishlistItems.filter(
    (item) =>
      item.property_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ToastContainer position="top-right" autoClose={2500} />
      {/* Sidebar Component */}

      {/* Wishlist Content */}
      <div className="flex-1 space-y-6 p-3 sm:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="mt-4 sm:mt-6 md:mt-12 text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
              View and manage your saved properties
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 relative w-full sm:w-auto">
            <button
              className="border border-gray-300 rounded px-4 py-2 text-xs sm:text-sm md:text-base flex items-center bg-white hover:bg-blue-50 transition-colors duration-150 shadow w-full sm:w-auto"
              onClick={() => window.location.reload()}
            >
              <span className="mr-2">↻</span>
              Refresh
            </button>
            <button
              className="border border-gray-300 rounded px-4 py-2 text-xs sm:text-sm md:text-base flex items-center bg-white hover:bg-blue-50 transition-colors duration-150 shadow w-full sm:w-auto"
              onClick={() => setShowExportDropdown((prev) => !prev)}
            >
              <span className="mr-2">⤓</span>
              Export
            </button>
            {/* Delete All Button */}
            <button
              className="border border-red-400 text-red-600 rounded px-4 py-2 text-xs sm:text-sm md:text-base flex items-center bg-white hover:bg-red-50 transition-colors duration-150 shadow w-full sm:w-auto"
              onClick={async () => {
                if (wishlistItems.length === 0) {
                  toast.warn("No items to delete.");
                  return;
                }
                if (
                  !window.confirm(
                    "Are you sure you want to delete all wishlist items?"
                  )
                )
                  return;
                try {
                  // Call backend to delete all wishlist items
                  const res = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`,
                    {
                      method: "DELETE",
                    }
                  );
                  if (res.ok) {
                    setWishlistItems([]);
                    toast.success("All wishlist items deleted.");
                  } else {
                    toast.error("Failed to delete all wishlist items.");
                  }
                } catch {
                  toast.error("Failed to delete all wishlist items.");
                }
              }}
            >
              Delete All
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-12 w-40 bg-white border rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 rounded-t-md"
                  onClick={handleExportJSON}
                >
                  Export as JSON
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 rounded-b-md"
                  onClick={handleExportPDF}
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card Container */}
        <div className="border rounded-xl shadow-lg bg-white">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-blue-600">
              Wishlist
            </h2>
            <div className="w-full md:w-64">
              <input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-3 py-2 text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Responsive Table for Desktop */}
          <div className="w-full overflow-x-auto hidden sm:block">
            <table className="min-w-[600px] w-full border-collapse text-xs sm:text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border text-left text-sm md:text-base">
                    Property ID
                  </th>
                  <th className="px-4 py-2 border text-left text-sm md:text-base">
                    Property Name
                  </th>
                  <th className="px-4 py-2 border text-left text-sm md:text-base">
                    Location
                  </th>
                  <th className="px-4 py-2 border text-right text-sm md:text-base">
                    Price
                  </th>
                  <th className="px-4 py-2 border text-left text-sm md:text-base">
                    Status
                  </th>
                  <th className="px-4 py-2 border text-center text-sm md:text-base">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWishlist.length > 0 ? (
                  filteredWishlist.map((item, idx) => (
                    <tr
                      key={item.property_id || idx}
                      className="hover:bg-blue-50 transition-colors duration-100"
                    >
                      <td className="px-4 py-2 border font-medium text-sm md:text-base">
                        {item.property_id}
                      </td>
                      <td className="px-4 py-2 border text-sm md:text-base">
                        {item.property_name}
                      </td>
                      <td className="px-4 py-2 border text-sm md:text-base">
                        {item.location}
                      </td>
                      <td className="px-4 py-2 border text-right text-sm md:text-base">
                        {formatINR(item.price)}
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded text-xs md:text-sm font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <select
                          defaultValue=""
                          className="border rounded px-2 py-1 text-xs md:text-sm focus:ring-2 focus:ring-blue-200"
                          onChange={(e) => {
                            if (e.target.value === "view") {
                              setSelectedItem(item);
                              setShowViewModal(true);
                            } else if (e.target.value === "remove") {
                              setSelectedItem(item);
                              setShowRemoveModal(true);
                            }
                            e.target.value = "";
                          }}
                        >
                          <option value="" disabled>
                            Actions
                          </option>
                          <option value="view">View Details</option>
                          <option value="remove">Remove from Wishlist</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-24 text-center text-sm md:text-base"
                    >
                      No properties found in your wishlist.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card layout for Mobile */}
          <div className="flex flex-col gap-4 sm:hidden p-4">
            {filteredWishlist.length > 0 ? (
              filteredWishlist.map((item, idx) => (
                <div
                  key={item.property_id || idx}
                  className="border rounded-lg p-4 shadow bg-blue-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-blue-700">
                      {item.property_name}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mb-1">
                    ID: {item.property_id}
                  </div>
                  <div className="text-gray-600 text-xs mb-1">
                    Location: {item.location}
                  </div>
                  <div className="text-gray-600 text-xs mb-1">
                    Price: {formatINR(item.price)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowViewModal(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowRemoveModal(true);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No properties found in your wishlist.
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-lg shadow flex items-center gap-2 transition"
            onClick={handleDeleteAllWishlist}
            disabled={wishlistItems.length === 0}
          >
            <span>Delete All</span>
          </button>
        </div>
      </div>
      {/* Remove Modal */}
      <Modal
        isOpen={showRemoveModal}
        title="Remove from Wishlist"
        onClose={() => setShowRemoveModal(false)}
      >
        <div className="mb-6 text-gray-800 text-center">
          Do you want to remove <b>{selectedItem?.property_name}</b> from your
          wishlist?
        </div>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={() => handleRemove(selectedItem.property_id)}
          >
            Yes
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={() => setShowRemoveModal(false)}
          >
            No
          </button>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showViewModal}
        title="View Property Details"
        onClose={() => setShowViewModal(false)}
      >
        <div className="mb-6 text-gray-800 text-center">
          View details for <b>{selectedItem?.property_name}</b>?
        </div>
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => handleViewDetails(selectedItem.property_id)}
          >
            Yes, View Details
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
            onClick={() => setShowViewModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Property Details Modal - Always use property.image_url with fallbacks */}
      {selectedItem && (
        <Modal
          isOpen={showViewModal}
          title="Property Details"
          onClose={() => setShowViewModal(false)}
        >
          <PropertyDetailsModal
            isOpen={showViewModal}
            property={selectedItem}
            onClose={() => setShowViewModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// In PropertyDetailsModal and table display, use property.image_url || property.image || property.propertyImage
const PropertyDetailsModal = ({ isOpen, property, onClose }) => {
  if (!isOpen || !property) return null;
  const imageUrl =
    property.image_url ||
    property.image ||
    property.propertyImage ||
    "/assets/Others/no-image.png";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-lg relative">
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-2xl font-bold text-blue-700">
            {property.property_name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-50 rounded-full text-2xl text-blue-700"
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col md:flex-row">
          {/* Left: Image and basic info */}
          <div className="md:w-1/2 p-4 flex flex-col">
            <img
              src={imageUrl}
              alt={property.property_name}
              className="w-full h-60 object-cover rounded-lg mb-4 border border-blue-100 shadow"
              onError={(e) => {
                e.target.src = "/assets/Others/no-image.png";
              }}
            />
            <h4 className="text-xl font-semibold text-blue-700 mb-2">
              {property.price ? formatINR(property.price) : "-"}
            </h4>
            <p className="text-gray-700 mb-2 text-base">
              {property.beds} Beds | {property.baths} Baths | {property.sqft}{" "}
              sqft
            </p>
            <p className="flex items-center text-gray-600 mb-2 text-base">
              {property.location}
            </p>
          </div>
          {/* Right: Property Features and Extra Details */}
          <div className="md:w-1/2 p-4 flex flex-col gap-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-2">
              <h5 className="font-semibold mb-2 text-blue-700">
                Property Features
              </h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Modern architecture
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>Well
                  ventilated spaces
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Premium fittings
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>24/7
                  security
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Smart home automation
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2 text-blue-700">
                Extra Property Details
              </h5>
              <ul className="text-sm space-y-1">
                <li>
                  <b>Status:</b> {property.status || "-"}
                </li>
                <li>
                  <b>Listed By:</b> {property.user_name || "-"}
                </li>
                <li>
                  <b>Email:</b> {property.user_email || "-"}
                </li>
                <li>
                  <b>Property ID:</b> {property.property_id || "-"}
                </li>
                {/* Add more details as needed */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
