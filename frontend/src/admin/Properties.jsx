import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../components/UserContext";
import Sidebar from "../components/Sidebar";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Pencil,
  Bed,
  Bath,
  Ruler,
  MapPin,
} from "lucide-react";
import { toast } from "react-toastify";

const formatPrice = (price) => {
  if (!price) return "";
  // Remove non-digits, parse as number, format with commas
  const num = Number(String(price).replace(/[^\d]/g, ""));
  if (isNaN(num)) return price;
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const PropertyCard = ({ property, onDelete, onEdit }) => {
  // Determine price label
  const priceLabel = (property.status || "").toLowerCase().includes("rent")
    ? "Rent per month"
    : "Price";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition overflow-hidden relative">
      {/* SOLD OUT Banner */}
      {property.status && property.status.toLowerCase() === "sold" && (
        <div
          className="absolute top-6 left-[-40px] rotate-[-30deg] bg-red-600 text-white font-extrabold text-lg px-16 py-2 shadow-lg opacity-90 z-20 select-none pointer-events-none"
          style={{
            transform: "rotate(-30deg)",
            width: "180px",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        >
          SOLD OUT
        </div>
      )}
      <button
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-white bg-opacity-80 rounded-full p-1 z-10"
        title="Delete Property"
        onClick={() => onDelete(property.id || property.property_id)}
      >
        <Trash2 size={20} />
      </button>
      {/* Hide Edit button if property is sold */}
      {!(property.status && property.status.toLowerCase() === "sold") && (
        <button
          className="absolute top-3 right-10 text-blue-500 hover:text-blue-700 bg-white bg-opacity-80 rounded-full p-1 z-10"
          title="Edit Property"
          onClick={() => onEdit(property)}
        >
          <Pencil size={20} />
        </button>
      )}
      <img
        src={property.imageUrl || property.image}
        alt={property.title}
        className="w-full h-48 object-cover bg-gray-100"
        loading="lazy"
      />
      <div className="p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-1 truncate">
          {property.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2 truncate">
          {property.address}
        </p>
        <p className="text-xs font-semibold text-gray-600 mb-1">{priceLabel}</p>
        <p className="text-xl font-extrabold text-green-700 mb-2 flex items-center">
          {formatPrice(property.price)}
        </p>
        <div className="flex gap-4 text-xs text-gray-700 mb-2">
          {property.beds && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-blue-500" /> {property.beds} Beds
            </span>
          )}
          {property.baths && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-blue-500" /> {property.baths} Baths
            </span>
          )}
          {property.sqft && (
            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-blue-500" /> {property.sqft} Sqft
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-blue-500" /> {property.address}
        </p>
        <p className="text-xs font-medium text-gray-700 mb-2">
          Status: {property.status}
        </p>
        {property.stats && (
          <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
            <span>{property.stats.likes} Likes</span>
            <span>{property.stats.comments} Comments</span>
            <span>{property.stats.views} Views</span>
          </div>
        )}
        {property.agents && (
          <div className="mt-3 flex -space-x-2">
            {property.agents.map((agent) => (
              <img
                key={agent.id}
                src={agent.avatar}
                alt={agent.name}
                title={agent.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: "",
    address: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    status: "For Sale",
    mapUrl: "",
    imageUrl: "",
    lat: "",
    lng: "",
  });
  const [propertyList, setPropertyList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [addStatus, setAddStatus] = useState(); // idle | creating | added | failed
  const [isLoading, setIsLoading] = useState(true); // <-- loading state
  const { user } = useContext(UserContext);

  // Fetch properties from backend API
  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
      .then((res) => res.json())
      .then((data) => {
        setPropertyList(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch properties", err);
        setPropertyList([]);
        setIsLoading(false);
      });
  }, []);

  // Filter properties based on search term and status
  const filteredProperties = propertyList.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter && statusFilter !== "all"
        ? statusFilter === "Premium"
          ? (property.status || "").toLowerCase().includes("premium")
          : (property.status || "").toLowerCase() === statusFilter.toLowerCase()
        : true;
    return matchesSearch && matchesStatus;
  });

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setAddStatus("creating");
    setIsLoading(true); // <-- show loading
    try {
      let imageUrl = newProperty.imageUrl;
      if (imageUrl && imageUrl.startsWith("data:")) {
        const formData = new FormData();
        formData.append("image", await fetch(imageUrl).then((r) => r.blob()));
        const uploadRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/properties/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const { imageUrl: azureUrl } = await uploadRes.json();
        imageUrl = azureUrl;
      }
      const propertyPayload = {
        ...newProperty,
        imageUrl,
        firebase_uid: user?.uid || user?.firebase_uid || "admin-uid",
        name: user?.name || "Admin",
        email: user?.email || "admin@example.com",
        role: user?.role || "admin",
      };
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/properties`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyPayload),
        }
      );
      if (!res.ok) throw new Error("Property creation failed");
      // Refetch properties
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
        .then((res) => res.json())
        .then((data) => {
          setPropertyList(data);
          setIsLoading(false); // <-- hide loading after fetch
        });
      setAddStatus("added");
      setTimeout(() => {
        setShowAddModal(false);
        setAddStatus("idle");
        setNewProperty({
          title: "",
          address: "",
          price: "",
          beds: "",
          baths: "",
          sqft: "",
          status: "For Sale",
          mapUrl: "",
          imageUrl: "",
          lat: "",
          lng: "",
        });
      }, 1200);
      toast.success("Property Added Successfully");
    } catch (err) {
      setAddStatus("failed");
      setTimeout(() => setAddStatus("idle"), 1500);
      setIsLoading(false); // <-- hide loading on error
      toast.error("Failed to add property");
    }
  };

  // Delete a single property
  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties/${id}`, {
      method: "DELETE",
    });
    setPropertyList((prev) =>
      prev.filter((p) => (p.id || p.property_id) !== id)
    );
    toast.success("Property Deleted Successfully");
  };

  // Delete all properties
  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL properties?"))
      return;
    // Delete each property one by one (could be optimized with a backend bulk delete route)
    await Promise.all(
      propertyList.map((p) =>
        fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/properties/${
            p.id || p.property_id
          }`,
          { method: "DELETE" }
        )
      )
    );
    setPropertyList([]);
    toast.success("All Properties Deleted Successfully");
  };

  // Open modal for editing
  const handleEditProperty = (property) => {
    setEditMode(true);
    setEditId(property.id || property.property_id);
    setShowAddModal(true);
    setNewProperty({
      title: property.title,
      address: property.address,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      status: property.status,
      mapUrl: property.mapUrl,
      imageUrl: property.imageUrl,
      lat: property.lat || "",
      lng: property.lng || "",
    });
  };

  // Update property handler
  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    setIsLoading(true); // <-- show loading
    let imageUrl = newProperty.imageUrl;
    if (imageUrl && imageUrl.startsWith("data:")) {
      const formData = new FormData();
      formData.append("image", await fetch(imageUrl).then((r) => r.blob()));
      const uploadRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/properties/upload-image`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!uploadRes.ok) throw new Error("Image upload failed");
      const { imageUrl: azureUrl } = await uploadRes.json();
      imageUrl = azureUrl;
    }
    const updatePayload = {
      title: newProperty.title,
      price: newProperty.price,
      status: newProperty.status,
      beds: newProperty.beds,
      baths: newProperty.baths,
      sqft: newProperty.sqft,
      imageUrl,
      mapUrl: newProperty.mapUrl,
    };
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/properties/${editId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      }
    );
    // Refetch properties
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
      .then((res) => res.json())
      .then((data) => {
        setPropertyList(data);
        setIsLoading(false); // <-- hide loading after fetch
      });
    setShowAddModal(false);
    setEditMode(false);
    setEditId(null);
    setNewProperty({
      title: "",
      address: "",
      price: "",
      beds: "",
      baths: "",
      sqft: "",
      status: "For Sale",
      mapUrl: "",
      imageUrl: "",
      lat: "",
      lng: "",
    });
    toast.success("Property Updated Successfully");
  };

  // Format price input with commas as user types
  const handlePriceChange = (e) => {
    let value = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    if (value) {
      value = Number(value).toLocaleString("en-IN");
    }
    setNewProperty({ ...newProperty, price: value });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 w-full space-y-6 p-4 md:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <p className="text-blue-700 font-semibold text-lg">
                Loading properties...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight drop-shadow-sm">
                Properties
              </h1>
              <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:gap-3 sm:ml-auto sm:mt-0">
                <button
                  className="bg-gradient-to-r from-red-500 to-red-400 hover:from-red-700 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-lg shadow flex items-center gap-2 transition w-full sm:w-auto"
                  onClick={handleDeleteAll}
                  disabled={propertyList.length === 0}
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete All</span>
                </button>
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-2 px-5 rounded-lg shadow flex items-center gap-2 transition w-full sm:w-auto"
                  onClick={() => {
                    setShowAddModal(true);
                    setEditMode(false);
                    setEditId(null);
                    setNewProperty({
                      title: "",
                      address: "",
                      price: "",
                      beds: "",
                      baths: "",
                      sqft: "",
                      status: "For Sale",
                      mapUrl: "",
                      imageUrl: "",
                      lat: "",
                      lng: "",
                    });
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Property</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-auto flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-[180px] border border-gray-300 bg-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All statuses</option>
                  <option value="For Sale">For Sale</option>
                  <option value="For Rent">For Rent</option>
                  <option value="Premium">For Premium</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id || property.property_id}
                    property={property}
                    onDelete={handleDeleteProperty}
                    onEdit={handleEditProperty}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-gray-500">
                  No properties found matching your criteria.
                </p>
              </div>
            )}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg space-y-6 relative border border-blue-100 animate-fade-in max-h-[80vh] overflow-y-auto"
                  onSubmit={editMode ? handleUpdateProperty : handleAddProperty}
                >
                  {/* Cross button to exit modal */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-3xl font-bold transition"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddStatus("");
                    }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-extrabold mb-2 text-blue-700 text-center tracking-tight">
                    {editMode ? "Update Property Details" : "Add New Property"}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="Property Name"
                        value={newProperty.title}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 21h18M9 21V9a3 3 0 016 0v12M9 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-4"
                          />
                        </svg>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="Address"
                        value={newProperty.address}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            address: e.target.value,
                          })
                        }
                        required
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <MapPin className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg select-none pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="text"
                        className="w-full border border-blue-200 rounded-lg px-12 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        style={{
                          paddingLeft: "2.8rem",
                          paddingRight: "2.8rem",
                        }}
                        placeholder={
                          newProperty.status === "For Rent"
                            ? "Rent per month (e.g. 30,000 - 1,40,000)"
                            : newProperty.status === "For Premium"
                            ? "Price (e.g. 90,00,000 - 6,00,00,000)"
                            : "Price (e.g. 40,00,000 - 5,00,00,000)"
                        }
                        value={newProperty.price}
                        onChange={handlePriceChange}
                        required
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <Ruler className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-1/3">
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          placeholder="Beds"
                          value={newProperty.beds}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              beds: e.target.value,
                            })
                          }
                          required={editMode}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <Bed className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="relative w-1/3">
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          placeholder="Baths"
                          value={newProperty.baths}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              baths: e.target.value,
                            })
                          }
                          required={editMode}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <Bath className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="relative w-1/3">
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          placeholder="Sqft"
                          value={newProperty.sqft}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              sqft: e.target.value,
                            })
                          }
                          required={editMode}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <Ruler className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        value={newProperty.status}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="For Sale">For Sale</option>
                        <option value="For Rent">For Rent</option>
                        <option value="For Premium">For Premium</option>
                        <option value="Sold">Sold</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <Filter className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        placeholder="Map URL (optional)"
                        value={newProperty.mapUrl}
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            mapUrl: e.target.value,
                          })
                        }
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                        <MapPin className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-lg px-4 py-2 pl-12 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                          placeholder="Image URL (or upload below)"
                          value={newProperty.imageUrl}
                          onChange={(e) =>
                            setNewProperty({
                              ...newProperty,
                              imageUrl: e.target.value,
                            })
                          }
                          required
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400">
                          <img
                            src="/assets/brand/image-icon.svg"
                            alt="Image"
                            className="w-5 h-5"
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Or Upload Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="ml-2"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new window.FileReader();
                              reader.onload = function (ev) {
                                setNewProperty((prev) => ({
                                  ...prev,
                                  imageUrl: ev.target.result,
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full ${
                      editMode
                        ? "bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500"
                        : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
                    } text-white font-bold py-3 px-4 rounded-lg mt-2 shadow-lg transition flex items-center justify-center gap-2`}
                    disabled={addStatus === "creating"}
                  >
                    {editMode ? (
                      <>
                        <Pencil className="w-5 h-5" /> Update Property Details
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" /> Add Property
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
