import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import PropertyMap from "../components/PropertyMap";
import { toast } from "react-toastify";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

const Visits = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const scheduledProperty = location.state?.property || null;
  const [showScheduleModal, setShowScheduleModal] = useState(
    !!scheduledProperty
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [visits, setVisits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Set filterDate default to today on mount
  const [filterDate, setFilterDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date");
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapVisit, setMapVisit] = useState(null);

  // State for geocoding
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Fetch visits for the current user on mount
  useEffect(() => {
    const fetchVisits = async () => {
      if (!user?.firebase_uid && !user?.uid) return;
      try {
        const firebaseUid = user.firebase_uid || user.uid || "";
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/visits?firebase_uid=${encodeURIComponent(firebaseUid)}`
        );
        let data = await res.json();
        // Defensive: ensure visits is always an array
        if (!Array.isArray(data)) {
          data = [];
        }
        setVisits(data);
      } catch (err) {
        setVisits([]);
        toast.error("Failed to fetch visits.");
      }
    };
    fetchVisits();
    // eslint-disable-next-line
  }, [user?.firebase_uid, user?.uid]);

  // Add visit when user picks a date
  const handleScheduleVisit = async () => {
    if (!scheduleDate || !scheduledProperty || !user?.email || !user?.name) {
      toast.error("Please fill all required fields.");
      return;
    }
    // Parse beds, baths, sqft from details if available, else try direct fields
    let beds = "";
    let baths = "";
    let sqft = "";
    if (scheduledProperty.details) {
      const parts = scheduledProperty.details.split("|").map((s) => s.trim());
      beds = parts[0]?.split(" ")[0] || "";
      baths = parts[1]?.split(" ")[0] || "";
      sqft = parts[2]?.split(" ")[0] || "";
    } else {
      beds = scheduledProperty.beds || scheduledProperty.Beds || "";
      baths = scheduledProperty.baths || scheduledProperty.Baths || "";
      sqft = scheduledProperty.sqft || scheduledProperty.Sqft || "";
    }
    // Robust property image extraction
    let propertyImage =
      scheduledProperty.image ||
      scheduledProperty.imageUrl ||
      scheduledProperty.propertyImage ||
      "";
    // Robust lat/lng extraction
    let lat = null;
    let lng = null;
    if (scheduledProperty.lat && scheduledProperty.lng) {
      lat = scheduledProperty.lat;
      lng = scheduledProperty.lng;
    } else if (scheduledProperty.latitude && scheduledProperty.longitude) {
      lat = scheduledProperty.latitude;
      lng = scheduledProperty.longitude;
    } else if (scheduledProperty.mapUrl) {
      // Try to extract lat/lng from mapUrl if it's a Google Maps link with coordinates
      const match = scheduledProperty.mapUrl.match(
        /@(-?\d+\.\d+),(-?\d+\.\d+)/
      );
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }
    // Get real-time date and time
    const now = new Date();
    const realTimeDate = now.toISOString().slice(0, 10); // yyyy-mm-dd
    const realTimeTime = now.toTimeString().slice(0, 5); // hh:mm
    const newVisit = {
      firebase_uid: user.firebase_uid || user.uid || "",
      property_id: scheduledProperty.id || scheduledProperty.property_id || "",
      property_name:
        scheduledProperty.title ||
        scheduledProperty.property_name ||
        scheduledProperty.name ||
        "Property Name Missing",
      propertyImage,
      imageUrl: scheduledProperty.imageUrl || scheduledProperty.image || "", // new: use imageUrl if available, else fallback
      mapUrl: scheduledProperty.mapUrl || "", // new: pass mapUrl
      location: scheduledProperty.address || scheduledProperty.location || "",
      date: scheduleDate || realTimeDate,
      time: scheduleTime ? scheduleTime : realTimeTime,
      status: new Date(scheduleDate) < new Date() ? "Completed" : "Upcoming",
      user_email: user.email,
      user_name: user.name,
      price: scheduledProperty.price || "",
      beds,
      baths,
      sqft,
      lat,
      lng,
    };
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisit),
      });
      // Refresh visits from backend
      const firebaseUid = user.firebase_uid || user.uid || "";
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/visits?firebase_uid=${encodeURIComponent(firebaseUid)}`
      );
      const data = await res.json();
      setVisits(data);
      toast.success("Visit scheduled successfully!");
    } catch (err) {
      toast.error("Failed to schedule visit.");
    }
    setShowScheduleModal(false);
    setScheduleDate("");
    setScheduleTime("");
  };

  // Delete a single visit
  const handleDeleteVisit = async (visitId) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/visits/${visitId}`, {
        method: "DELETE",
      });
      setVisits((prev) => prev.filter((v) => v.id !== visitId));
      toast.success("Visit deleted.");
    } catch (err) {
      toast.error("Failed to delete visit.");
    }
  };

  // Delete all visits for the user
  const handleDeleteAllVisits = async () => {
    try {
      const firebaseUid = user.firebase_uid || user.uid || "";
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/visits/all?firebase_uid=${encodeURIComponent(firebaseUid)}`,
        {
          method: "DELETE",
        }
      );
      setVisits([]);
      toast.success("All visits deleted.");
    } catch (err) {
      toast.error("Failed to delete all visits.");
    }
  };

  // Defensive: ensure visits is always an array, even if backend returns error object
  const safeVisits = Array.isArray(visits) ? visits : [];
  // Filter visits based on search query and date
  const filteredVisits = safeVisits
    .filter((visit) => {
      const propertyName = visit.propertyName || visit.property_name || "";
      const address = visit.address || visit.location || "";
      const matchesQuery =
        propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        address.toLowerCase().includes(searchQuery.toLowerCase());
      // Always compare ISO date strings (first 10 chars)
      const visitDateISO = visit.date ? visit.date.slice(0, 10) : "";
      const filterDateISO = filterDate ? filterDate.slice(0, 10) : "";
      const matchesDate = filterDate ? visitDateISO === filterDateISO : true;
      return matchesQuery && matchesDate;
    })
    .sort((a, b) => {
      // Live sort by date and time (descending)
      const dateA = new Date(a.date + "T" + (a.time || "00:00"));
      const dateB = new Date(b.date + "T" + (b.time || "00:00"));
      if (sortOption === "date") {
        return dateB - dateA;
      } else if (sortOption === "date-asc") {
        return dateA - dateB;
      } else if (sortOption === "name") {
        const nameA = (a.propertyName || a.property_name || "").toLowerCase();
        const nameB = (b.propertyName || b.property_name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortOption === "location") {
        const locA = (a.address || a.location || "").toLowerCase();
        const locB = (b.address || b.location || "").toLowerCase();
        return locA.localeCompare(locB);
      }
      return 0;
    });

  // Pagination logic
  const visitsPerPage = 2;
  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = filteredVisits.slice(
    indexOfFirstVisit,
    indexOfLastVisit
  );
  const totalPages = Math.ceil(filteredVisits.length / visitsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Helper to get the correct map coordinates for a visit, preferring scheduledProperty if it matches
  const getVisitLatLng = (visit) => {
    // Prefer scheduledProperty if it matches
    if (
      scheduledProperty &&
      (visit.property_id === scheduledProperty.id ||
        visit.property_id === scheduledProperty.property_id ||
        visit.title === scheduledProperty.title ||
        visit.property_name === scheduledProperty.title)
    ) {
      // If scheduledProperty has valid lat/lng, use them
      if (
        typeof scheduledProperty.lat === "number" &&
        typeof scheduledProperty.lng === "number" &&
        !isNaN(scheduledProperty.lat) &&
        !isNaN(scheduledProperty.lng)
      ) {
        return {
          lat: scheduledProperty.lat,
          lng: scheduledProperty.lng,
        };
      }
      // Try to extract from mapUrl if present
      if (scheduledProperty.mapUrl) {
        const match = scheduledProperty.mapUrl.match(
          /([+-]?\d+\.\d+),([+-]?\d+\.\d+)/
        );
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
          };
        }
      }
    }
    // Fallback to visit's own lat/lng
    if (
      typeof visit.lat === "number" &&
      typeof visit.lng === "number" &&
      !isNaN(visit.lat) &&
      !isNaN(visit.lng)
    ) {
      return { lat: visit.lat, lng: visit.lng };
    }
    // Try to extract from visit.mapUrl if present
    if (visit.mapUrl) {
      const match = visit.mapUrl.match(/([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
      }
    }
    // No valid coordinates found
    return { lat: null, lng: null };
  };

  // Geocoding helper (Nominatim API)
  const geocodeAddress = async (address) => {
    if (!address) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (err) {}
    return null;
  };

  // Effect: geocode if mapVisit has address/location but no lat/lng
  useEffect(() => {
    if (showMapModal && mapVisit) {
      const hasCoords =
        typeof mapVisit.lat === "number" &&
        typeof mapVisit.lng === "number" &&
        !isNaN(mapVisit.lat) &&
        !isNaN(mapVisit.lng);
      if (!hasCoords && (mapVisit.address || mapVisit.location)) {
        setGeoLoading(true);
        setGeoError(null);
        geocodeAddress(mapVisit.address || mapVisit.location).then((coords) => {
          if (coords) setGeoCoords(coords);
          else setGeoError("Could not locate address on map.");
          setGeoLoading(false);
        });
      } else {
        setGeoCoords(null);
        setGeoLoading(false);
        setGeoError(null);
      }
    }
  }, [showMapModal, mapVisit]);

  // Helper for displaying date as dd-mm-yyyy (for display only, not for input value)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-");
      return `${d}-${m}-${y}`;
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 tracking-tight">
          Your Property Visits
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by property or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-4 py-2 rounded w-full md:w-1/2 focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              // Always use yyyy-mm-dd for the input value
              // If user tries to enter dd-mm-yyyy, convert to yyyy-mm-dd
              let val = e.target.value;
              if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
                const [d, m, y] = val.split("-");
                setFilterDate(`${y}-${m}-${d}`);
              } else {
                setFilterDate(val);
              }
            }}
            className="border px-4 py-2 rounded w-full md:w-1/4 focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-4 py-2 rounded w-full md:w-1/4 focus:ring-2 focus:ring-blue-200"
          >
            <option value="date">Sort by Date (Newest)</option>
            <option value="date-asc">Sort by Date (Oldest)</option>
            <option value="name">Sort by Property Name (A-Z)</option>
            <option value="location">Sort by Location</option>
          </select>
        </div>
        <div className="space-y-6">
          {currentVisits.length === 0 ? (
            <div className="text-center text-gray-500">No visits found.</div>
          ) : (
            currentVisits.map((visit) => {
              // Always use the visit's own image fields
              const imageSrc = visit.imageUrl || visit.propertyImage || "";
              const { lat: mapLat, lng: mapLng } = getVisitLatLng(visit);
              const mapTitle =
                visit.title ||
                visit.propertyName ||
                visit.property_name ||
                "Property Location";
              return (
                <div
                  key={visit.id}
                  className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-xl shadow bg-blue-50/50"
                >
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={mapTitle}
                      className="w-32 h-24 object-cover rounded border border-blue-100 shadow"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-blue-700">
                      {mapTitle}
                    </h2>
                    <p className="text-gray-600">
                      {visit.address || visit.location}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Date: {visit.date ? formatDisplayDate(visit.date) : ""}
                    </p>
                    <p className="text-gray-500 text-sm">Time: {visit.time}</p>
                    <p
                      className={`text-sm font-bold ${
                        visit.status === "Completed"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      Status: {visit.status}
                    </p>
                    <button
                      className="text-blue-500 underline text-sm cursor-pointer mt-2 hover:text-blue-700"
                      onClick={() => {
                        setMapVisit({
                          ...visit,
                          image: imageSrc,
                          lat: mapLat,
                          lng: mapLng,
                          title: mapTitle,
                        });
                        setShowMapModal(true);
                      }}
                    >
                      View on Map
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteVisit(visit.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2 md:mt-0 shadow"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
        {/* Delete All Button */}
        {visits.length > 0 && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleDeleteAllVisits}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
            >
              Delete All Visits
            </button>
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded shadow ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Schedule Visit Modal */}
      {showScheduleModal && scheduledProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Schedule a Visit for {scheduledProperty.title}
            </h2>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="border px-4 py-2 rounded mb-4 w-full focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="border px-4 py-2 rounded mb-4 w-full focus:ring-2 focus:ring-blue-200"
            />
            <div className="flex gap-4">
              <button
                onClick={handleScheduleVisit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                disabled={!scheduleDate}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Map Modal */}
      {showMapModal && mapVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 text-2xl"
              onClick={() => setShowMapModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-blue-700">
              {mapVisit.title ||
                mapVisit.propertyName ||
                mapVisit.property_name ||
                "Property Name Missing"}
            </h2>
            <p className="mb-2 text-gray-600">
              {mapVisit.address || mapVisit.location}
            </p>
            {/* Side-by-side image and map */}
            <div className="w-full flex flex-col md:flex-row gap-6 mb-6">
              {/* Image */}
              {(mapVisit.image ||
                mapVisit.propertyImage ||
                mapVisit.image_url ||
                mapVisit.property_image_url) && (
                <div className="flex-1 flex justify-center items-center rounded-xl border border-blue-100 shadow bg-white min-w-[220px] max-w-[400px] max-h-72 overflow-hidden">
                  <img
                    src={
                      mapVisit.image ||
                      mapVisit.propertyImage ||
                      mapVisit.image_url ||
                      mapVisit.property_image_url ||
                      ""
                    }
                    alt={
                      mapVisit.title ||
                      mapVisit.propertyName ||
                      mapVisit.property_name ||
                      "Property"
                    }
                    className="object-cover w-full h-72 rounded-xl"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>
              )}
              {/* Map */}
              <div className="flex-1 min-w-[320px] max-w-[600px] h-72 rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg bg-white flex items-center justify-center">
                {/* Real-time map logic */}
                {(() => {
                  const hasCoords =
                    typeof mapVisit.lat === "number" &&
                    typeof mapVisit.lng === "number" &&
                    !isNaN(mapVisit.lat) &&
                    !isNaN(mapVisit.lng);
                  if (hasCoords) {
                    return (
                      <PropertyMap
                        lat={mapVisit.lat}
                        lng={mapVisit.lng}
                        title={
                          mapVisit.title ||
                          mapVisit.propertyName ||
                          mapVisit.property_name
                        }
                      />
                    );
                  } else if (geoLoading) {
                    return (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                        <span className="animate-spin h-8 w-8 mb-2 border-4 border-blue-400 border-t-transparent rounded-full"></span>
                        <span>Locating area...</span>
                      </div>
                    );
                  } else if (geoCoords) {
                    return (
                      <PropertyMap
                        lat={geoCoords.lat}
                        lng={geoCoords.lng}
                        title={
                          mapVisit.title ||
                          mapVisit.propertyName ||
                          mapVisit.property_name
                        }
                      />
                    );
                  } else if (geoError) {
                    return (
                      <div className="flex flex-col items-center justify-center w-full h-full text-red-500 font-semibold">
                        <span>{geoError}</span>
                      </div>
                    );
                  } else if (mapVisit.mapUrl) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-red-500 font-semibold mb-2">
                          Location data not available for this visit.
                        </div>
                        <a
                          href={mapVisit.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow mt-2"
                        >
                          View on Map
                        </a>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center justify-center h-full text-red-500 font-semibold">
                        Location data not available for this visit.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="font-semibold">Date:</span>
              {/* Only show date part */}
              {mapVisit.date ? formatDisplayDate(mapVisit.date) : ""}
              <span className="font-semibold">Time:</span> {mapVisit.time}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visits;
