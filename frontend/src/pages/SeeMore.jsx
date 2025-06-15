import React, { useState, useEffect, useRef, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// import { useLocation } from "react-router-dom";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Mic,
  MapPin,
  Heart,
  MapIcon,
  List,
  X,
  Bed,
  Bath,
  Ruler,
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PropertyMap from "../components/PropertyMap";
import Payment from "../pages/Payment";
import { UserContext } from "../components/UserContext";
import { useNotification } from "../components/NotificationContext.jsx";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMap } from "react-leaflet";

function getQueryParam(name, search) {
  const params = new URLSearchParams(search);
  return params.get(name);
}

export default function SeeMore() {
  const location = useLocation();
  const params = useParams();
  // Accept property_id from state, params, or query string
  const property_id =
    location.state?.property_id ||
    params.id ||
    getQueryParam("property_id", location.search);

  // If property_id is not in state, try to get it from the URL param
  const effectivePropertyId = property_id || params.id;

  useEffect(() => {
    if (effectivePropertyId) {
      // Find and scroll to the property card or highlight it
      const el = document.getElementById(effectivePropertyId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [effectivePropertyId]);

  const [activeSection, setActiveSection] = useState("sale");
  const [wishlist, setWishlist] = useState([]);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyMap, setShowPropertyMap] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [viewMode, setViewMode] = useState("split");
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([1000000, 9000000]);
  const [bedroomRange, setBedroomRange] = useState([1, 5]);
  const [bathroomRange, setBathroomRange] = useState([1, 5]);
  const [areaRange, setAreaRange] = useState([500, 3000]);
  const [showPayment, setShowPayment] = useState(false);
  const [propertyList, setPropertyList] = useState([]);
  const [allProperties, setAllProperties] = useState([]); // <-- new state for all properties

  // Track which properties have location enabled to suppress repeated alert
  const [locationEnabledProperties, setLocationEnabledProperties] = useState(
    () => new Set()
  );

  const navigate = useNavigate();

  const mapContainerRef = useRef(null);

  const handleAdvancePayment = () => {
    setShowPayment(true);
    if (selectedProperty) {
      // Pass imageUrl explicitly to Payment component
      window.selectedProperty = selectedProperty; // ensure global for Payment
      window.selectedPropertyImageUrl =
        selectedProperty.imageUrl ||
        selectedProperty.image ||
        selectedProperty.propertyImage ||
        "https://realestateblobstorage.blob.core.windows.net/projects/default-image.png";
      notifyUser(
        "Advance Payment",
        selectedProperty?.title || "",
        selectedProperty.image || ""
      ).then(() => {
        toast.success(`Advance payment started for ${selectedProperty.title}`);
        refreshUnreadCount();
      });
    } else {
      notifyUser(`Advance payment started for ${selectedProperty.title}`).then(
        () => {
          toast.success("Advance payment started.");
          refreshUnreadCount();
        }
      );
    }
  };

  // Notify backend of advance payment with property name and image
  const notifyUser = async (
    message,
    property_name = "",
    property_image = "",
    notification_id = null
  ) => {
    try {
      // Get user context for firebase_uid
      const userCtx = user || {};
      const firebase_uid = userCtx.uid || userCtx.firebase_uid || null;
      if (!firebase_uid) {
        toast.error("User not authenticated. Notification not sent.");
        return;
      }
      // Use provided notification_id or generate new
      const notif_id =
        notification_id ||
        `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date();
      const created_at = now.toISOString().slice(0, 19).replace("T", " ");
      const date = now.toISOString().slice(0, 10);
      // Defensive: always send property_name and property_image as strings
      const payload = {
        notification_id: notif_id,
        firebase_uid,
        message: message || "",
        status: "Unread",
        created_at,
        date,
        property_name: property_name || "",
        property_image: property_image || "",
      };
      // If property_image is a file, upload to Azure Blob Storage first
      if (property_image && typeof property_image !== "string") {
        const formData = new FormData();
        formData.append("image", property_image);
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.imageUrl) {
          payload.property_image = data.imageUrl;
        } else {
          payload.property_image = "";
        }
      }
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      toast.error("Failed to send notification.");
    }
  };

  // Fetch properties from backend API and store in propertyList only
  const fetchProperties = () => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/properties`)
      .then((res) => res.json())
      .then((data) => {
        let normalized = (Array.isArray(data) ? data : []).map((property) => {
          let images = [];
          if (Array.isArray(property.images) && property.images.length > 0) {
            images = property.images;
          } else if (property.imageUrl) {
            images = [property.imageUrl];
          } else if (property.image) {
            images = [property.image];
          } else if (property.image_url) {
            images = [property.image_url];
          }
          return { ...property, images };
        });
        // If no rent properties from backend and we have propertiesForRent from navigation, use them
        if (
          activeSection === "rent" &&
          !normalized.some((p) =>
            (p.status || "").toLowerCase().includes("rent")
          ) &&
          Array.isArray(propertiesForRent) &&
          propertiesForRent.length > 0
        ) {
          normalized = [
            ...normalized,
            ...propertiesForRent.map((property) => {
              let images = [];
              if (
                Array.isArray(property.images) &&
                property.images.length > 0
              ) {
                images = property.images;
              } else if (property.imageUrl) {
                images = [property.imageUrl];
              } else if (property.image) {
                images = [property.image];
              } else if (property.image_url) {
                images = [property.image_url];
              }
              return {
                ...property,
                images,
                status: property.status || "For Rent",
              };
            }),
          ];
        }
        setAllProperties(normalized); // <-- store all properties
        setPropertyList(normalized);
      })
      .catch(() => {
        // If backend fails, fallback to propertiesForRent if available
        if (
          activeSection === "rent" &&
          Array.isArray(propertiesForRent) &&
          propertiesForRent.length > 0
        ) {
          setPropertyList(
            propertiesForRent.map((property) => {
              let images = [];
              if (
                Array.isArray(property.images) &&
                property.images.length > 0
              ) {
                images = property.images;
              } else if (property.imageUrl) {
                images = [property.imageUrl];
              } else if (property.image) {
                images = [property.image];
              } else if (property.image_url) {
                images = [property.image_url];
              }
              return {
                ...property,
                images,
                status: property.status || "For Rent",
              };
            })
          );
        } else {
          setPropertyList([]);
        }
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter propertyList by status for activeSection
  const getActiveProperties = () => {
    return propertyList.filter((property) => {
      // Normalize status: lowercase, trim, remove all whitespace, replace underscores and hyphens
      let propStatus = (property.status || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]/g, "");

      // For debugging: log property id and normalized status
      // console.log('Property:', property.property_id || property.id, 'Status:', property.status, 'Normalized:', propStatus);

      let inStatus = true;
      if (activeSection === "sale") {
        inStatus =
          propStatus.includes("sale") || propStatus.includes("forsale");
      } else if (activeSection === "rent") {
        inStatus =
          propStatus.includes("rent") || propStatus.includes("forrent");
      } else if (activeSection === "premium") {
        inStatus = propStatus.includes("premium");
      }
      let priceStr = (property.price || "").replace(/[^\d]/g, "");
      let priceNum = parseInt(priceStr, 10);
      const inPriceRange =
        priceNum >= priceRange[0] && priceNum <= priceRange[1];
      const inSearch = (property.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return inStatus && inPriceRange && inSearch;
    });
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("Speech recognition not supported");
      return;
    }
  }, []);
  const { user } = useContext(UserContext);
  const { refreshUnreadCount } = useNotification();
  // Helper to get a unique key for a property (prefer property_id, then id, then title+address)
  const getPropertyKey = (property) => {
    if (property.property_id) return String(property.property_id);
    if (property.id) return String(property.id);
    if (property.title && property.address)
      return property.title + property.address;
    return ""; // fallback to empty string if no key found
  };

  const isInWishlist = (property) => {
    const key = getPropertyKey(property);
    return wishlist.some((item) => getPropertyKey(item) === key);
  };

  // Add/remove property from wishlist, ensuring only one entry per property and correct notification
  const handleAddToWishlist = async (property) => {
    const propertyKey = getPropertyKey(property);
    const exists = wishlist.some(
      (item) => getPropertyKey(item) === propertyKey
    );

    // Prepare wishlist item (ensure property_id is set to propertyKey)
    let beds = property.beds;
    let baths = property.baths;
    let sqft = property.sqft;
    if ((!beds || !baths || !sqft) && property.details) {
      const detailsArr = property.details.split("|").map((s) => s.trim());
      beds = beds || (detailsArr[0] && detailsArr[0].split(" ")[0]) || "";
      baths = baths || (detailsArr[1] && detailsArr[1].split(" ")[0]) || "";
      sqft = sqft || (detailsArr[2] && detailsArr[2].split(" ")[0]) || "";
    }
    beds = beds || "1";
    baths = baths || "1";
    sqft = sqft || "500";
    const name = user?.name || "";
    const email = user?.email || "";
    const image_url =
      property.imageUrl ||
      property.image ||
      property.image_url ||
      "/assets/Others/no-image.png";
    const wishlistItem = {
      property_id: propertyKey,
      property_name: property.title,
      location: property.address,
      price: property.price,
      status: "Available",
      beds,
      baths,
      sqft,
      user_name: name,
      user_email: email,
      image_url,
    };

    if (!exists) {
      setWishlist((prev) => [...prev, wishlistItem]);
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(wishlistItem),
        });
        toast.success(`Added ${property.title} to your wishlist!`);
      } catch (err) {
        toast.error("Failed to add to wishlist.");
      }
    } else {
      setWishlist((prev) =>
        prev.filter((item) => getPropertyKey(item) !== propertyKey)
      );
      try {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/${propertyKey}`,
          { method: "DELETE" }
        );
        toast.info(`Removed ${property.title} from your wishlist.`);
      } catch (err) {
        toast.error("Failed to remove from wishlist.");
      }
    }
  };
  const handleDeleteWishlist = async (propertyId) => {
    setWishlist(wishlist.filter((item) => item.id !== propertyId));
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/${propertyId}`,
        {
          method: "DELETE",
        }
      );
      toast.success("Removed from wishlist!");
    } catch (err) {
      toast.error("Failed to remove from wishlist.");
    }
  };

  const handleReorderWishlist = async (newWishlist) => {
    setWishlist(newWishlist);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: newWishlist.map((item, idx) => ({ id: item.id, order: idx })),
        }),
      });
      toast.success("Wishlist reordered!");
    } catch (err) {
      toast.error("Failed to reorder wishlist.");
    }
  };
  const handleNavigation = (id) => {
    if (location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: id } });
    }
  };

  const handleViewDetails = (property) => {
    // Use property_id if available, else fallback to title+address as unique key
    const propertyKey =
      property.property_id || property.id || property.title + property.address;
    if (locationEnabledProperties.has(propertyKey)) {
      // Already enabled for this property, skip alert
      setLocationEnabled(true);
      setSelectedProperty(property);
      setShowPropertyMap(true);
      return;
    }
    const confirmLocation = window.confirm("Do you want to turn on location?");
    if (confirmLocation) {
      setLocationEnabledProperties((prev) => new Set(prev).add(propertyKey));
      setLocationEnabled(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Location enabled:", position.coords);
            setLocationEnabled(true);
            setSelectedProperty(property);
            setShowPropertyMap(true);
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Unable to access your location.");
            setLocationEnabled(false);
            setSelectedProperty(property);
            setShowPropertyMap(true);
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        setLocationEnabled(false);
        setSelectedProperty(property);
        setShowPropertyMap(true);
      }
    } else {
      toast.info("Property details are displayed without map view.");
      setLocationEnabled(false);
      setSelectedProperty(property);
      setShowPropertyMap(true);
    }
  };

  // Helper: Speak text with a female computer voice
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech to avoid overlap
      window.speechSynthesis.cancel();
      // Ensure voices are loaded before speaking
      let voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speak(text);
        };
        // Trigger loading voices in some browsers
        window.speechSynthesis.getVoices();
        return;
      }
      const utterance = new window.SpeechSynthesisUtterance(text);
      // Prefer a female Indian English voice
      const femaleIndianVoice =
        voices.find((v) => v.lang === "en-IN" && v.gender === "female") ||
        voices.find(
          (v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female")
        );
      const anyIndianVoice = voices.find((v) => v.lang === "en-IN");
      const femaleVoice =
        femaleIndianVoice ||
        anyIndianVoice ||
        voices.find((v) => v.lang.startsWith("en") && v.gender === "female") ||
        voices.find(
          (v) =>
            v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
        ) ||
        voices.find(
          (v) =>
            v.lang.startsWith("en") && v.name.toLowerCase().includes("zira")
        ) ||
        voices.find(
          (v) =>
            v.lang.startsWith("en") && v.name.toLowerCase().includes("susan")
        ) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.rate = 1;
      utterance.volume = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      if (recognition && recognition.stop) recognition.stop();
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      // Play the female voice prompt, then start recognition only after it finishes
      if ("speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        const promptText =
          "Hello! Welcome to the Real Estate Website. Mention the property name you want to search?";
        const utterance = new window.SpeechSynthesisUtterance(promptText);
        let voices = synth.getVoices();
        // Prefer a female Indian English voice
        const femaleIndianVoice =
          voices.find((v) => v.lang === "en-IN" && v.gender === "female") ||
          voices.find(
            (v) => v.lang === "en-IN" && v.name.toLowerCase().includes("female")
          );
        const anyIndianVoice = voices.find((v) => v.lang === "en-IN");
        const femaleVoice =
          femaleIndianVoice ||
          anyIndianVoice ||
          voices.find(
            (v) => v.lang.startsWith("en") && v.gender === "female"
          ) ||
          voices.find(
            (v) =>
              v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
          ) ||
          voices.find(
            (v) =>
              v.lang.startsWith("en") && v.name.toLowerCase().includes("zira")
          ) ||
          voices.find(
            (v) =>
              v.lang.startsWith("en") && v.name.toLowerCase().includes("susan")
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1;
        utterance.volume = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
          startRecognition();
        };
        synth.cancel(); // Cancel any ongoing speech
        synth.speak(utterance);
      } else {
        startRecognition();
      }
    }, 500);
  };

  function startRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const newRecognition = new SpeechRecognition();
    newRecognition.lang = "en-IN"; // Use Indian English
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;
    setIsListening(true);
    toast.info("Listening... Please speak your property search query.");
    newRecognition.onresult = (event) => {
      setIsListening(false);
      const lastResult =
        event.results[event.results.length - 1][0].transcript.trim();
      setSearchQuery(lastResult);
      // Enhanced normalization: lowercase, trim, collapse spaces, remove punctuation
      const normalize = (str) =>
        (str || "")
          .toLowerCase()
          .replace(/[^a-z0-9 ]/gi, "")
          .replace(/\s+/g, " ")
          .trim();
      // For abbreviations: also try removing spaces (e.g., D L F -> DLF)
      const spoken = normalize(lastResult);
      const spokenNoSpace = spoken.replace(/\s+/g, "");
      // Try exact match first
      let found = allProperties.find((p) => {
        const titleNorm = normalize(p.title);
        const titleNoSpace = titleNorm.replace(/\s+/g, "");
        return titleNorm === spoken || titleNoSpace === spokenNoSpace;
      });
      // If not found, try includes/partial match
      if (!found) {
        found = allProperties.find((p) => {
          const titleNorm = normalize(p.title);
          const titleNoSpace = titleNorm.replace(/\s+/g, "");
          return (
            titleNorm.includes(spoken) ||
            spoken.includes(titleNorm) ||
            titleNoSpace.includes(spokenNoSpace) ||
            spokenNoSpace.includes(titleNoSpace)
          );
        });
      }
      if (found) {
        // Only add a period if the title doesn't end with punctuation
        let titlePart = found.title;
        if (!/[.!?]$/.test(titlePart.trim())) titlePart = titlePart.trim();
        // Build the speech string without forced period after property name
        let speechText = `Here is the property: ${titlePart}`;
        if (found.details) speechText += `. ${found.details}`;
        speechText += `. Located at ${
          found.address || "unknown location"
        }. Price: ${priceToIndianWords(
          found.price
        )}. Turning on location to view the map.`;
        speak(speechText);
        setSelectedProperty(found);
        setShowPropertyMap(true); // Ensure modal opens immediately
        setTimeout(() => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => {
                setLocationEnabled(true);
                setShowPropertyMap(true);
                toast.success("Location enabled. Showing map.");
              },
              () => {
                setLocationEnabled(false);
                setShowPropertyMap(true);
                toast.error("Unable to access your location.");
              }
            );
          } else {
            setLocationEnabled(false);
            setShowPropertyMap(true);
            toast.error("Geolocation is not supported by your browser.");
          }
        }, 3500);
      } else {
        toast.error("No matching property found. Please try again.");
        speak("No matching property found. Please try again.");
      }
    };
    newRecognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast.error("Speech recognition error. Please try again.");
      }
    };
    newRecognition.onend = () => {
      setIsListening(false);
      toast.info("Stopped listening.");
    };
    try {
      newRecognition.start();
    } catch (error) {
      toast.error("Couldn't start voice recognition. Please try again.");
      setIsListening(false);
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const MicrophonePulse = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30"></span>
    </div>
  );

  const SatelliteToggle = () => (
    <button
      onClick={() => setSatelliteMode((prev) => !prev)}
      className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium"
    >
      {satelliteMode ? "Disable Satellite" : "Enable Satellite"}
    </button>
  );

  // Add formatPrice function from Properties.jsx
  const formatPrice = (price) => {
    if (!price) return "";
    const num = Number(String(price).replace(/[^\d]/g, ""));
    if (isNaN(num)) return price;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  // Helper: Extract lat/lng from mapUrl if not present
  const getLatLng = (property) => {
    if (property.lat && property.lng) {
      return { lat: property.lat, lng: property.lng };
    }
    // Try to extract from mapUrl (Google Maps link)
    if (property.mapUrl) {
      // Example: https://www.google.com/maps?q=12.9716,77.5946
      const match = property.mapUrl.match(/([+-]?\d+\.\d+),([+-]?\d+\.\d+)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    }
    return { lat: null, lng: null };
  };

  // Helper to normalize property status for display
  const getDisplayStatus = (status) => {
    if (!status) return "Unknown";
    const normalized = status.toLowerCase();
    if (normalized.includes("sale")) return "For Sale";
    if (normalized.includes("rent")) return "For Rent";
    if (normalized.includes("premium")) return "For Premium";
    return status;
  };

  // Update PropertyCard to use the correct handler and ensure only one add/remove per click
  const PropertyCard = ({
    property,
    buttonColor,
    onAddToWishlist,
    onViewDetails,
  }) => {
    const imageSrc = property.imageUrl || property.image;
    const images =
      Array.isArray(property.images) && property.images.length > 0
        ? property.images
        : imageSrc
        ? [imageSrc]
        : [];

    // Determine price label
    const priceLabel = (property.status || "").toLowerCase().includes("rent")
      ? "Rent per month"
      : "Price";

    const wishlisted = isInWishlist(property);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleWishlistClick = () => {
      setIsAnimating(true);
      onAddToWishlist(property);
      setTimeout(() => setIsAnimating(false), 200); // Animation duration
    };

    return (
      <div
        id={getPropertyKey(property)}
        className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 relative"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <div
          className="relative group overflow-hidden"
          style={{ width: "100%", height: "224px" }}
        >
          {images.length > 1 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={8}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={true}
              style={{ width: "100%", height: "224px" }}
              className="property-card-swiper"
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={`Property image ${idx + 1}`}
                    className="w-full h-56 object-cover bg-gray-100"
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "224px",
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <img
              src={images[0] || "/assets/Others/no-image.png"}
              alt={property.title}
              className="w-full h-56 object-cover bg-gray-100"
              style={{ objectFit: "cover", width: "100%", height: "224px" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition z-10 border-2
              ${
                wishlisted
                  ? "bg-red-100 border-red-400"
                  : "bg-white border-gray-200 hover:bg-red-100 hover:border-red-400"
              }
            ${isAnimating ? "scale-110" : ""}
          `}
            onClick={handleWishlistClick}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              transition: "background 0.2s, border 0.2s, transform 0.15s",
              outline: wishlisted ? "2px solid #ef4444" : "none",
            }}
            disabled={false}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-150
                ${
                  wishlisted
                    ? "text-red-600 fill-red-600"
                    : "text-gray-400 group-hover:text-red-400"
                }
              `}
            />
          </button>
        </div>
        <div className="p-5 relative">
          <h3 className="text-lg font-bold text-blue-800 mb-1 truncate">
            {property.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2 truncate">
            {property.address}
          </p>
          <p className="text-xs font-semibold text-gray-600 mb-1">
            {priceLabel}
          </p>
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
                <Bath className="w-4 h-4 text-blue-500" /> {property.baths}{" "}
                Baths
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
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => onViewDetails(property)}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                buttonColor === "blue"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : buttonColor === "green"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FilterRangeComponent = () => {
    const handleApplyFilters = () => {
      setShowFilter(false);
      toast.success("Filters applied successfully!");
    };

    const handleReset = () => {
      setPriceRange([1000000, 9000000]);
      setBedroomRange([1, 5]);
      setBathroomRange([1, 5]);
      setAreaRange([500, 3000]);
      setShowFilter(false);
      toast.success("Filters reset!");
    };

    return (
      <div className="relative flex justify-center items-center w-full">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="h-10 w-10 rounded-full p-0 bg-white border-gray-200 hover:bg-gray-100 flex items-center justify-center"
        >
          <SlidersHorizontal className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Filter properties</span>
        </button>
        {showFilter && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={() => setShowFilter(false)}
          >
            <div
              className="relative w-[95vw] max-w-xs sm:w-96 p-4 sm:p-5 rounded-xl shadow-lg bg-white overflow-y-auto max-h-[80vh]"
              style={{ zIndex: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-900">
                  Filter Properties
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Price Range
                    </label>
                    <span className="text-sm text-gray-500">
                      {formatPrice(priceRange[0])} -{" "}
                      {formatPrice(priceRange[1])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="15000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="500000"
                    max="15000000"
                    step="100000"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium"
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper for real-time map panning
  const MapUpdater = ({ coords }) => {
    const map = useMap();
    React.useEffect(() => {
      if (
        typeof coords.lat === "number" &&
        typeof coords.lng === "number" &&
        !isNaN(coords.lat) &&
        !isNaN(coords.lng)
      ) {
        map.flyTo([coords.lat, coords.lng], 16);
      }
    }, [coords, map]);
    return null;
  };

  const SimplePropertyMap = ({ property }) => {
    const [geoCoords, setGeoCoords] = React.useState(null);
    const [geoLoading, setGeoLoading] = React.useState(false);
    const [geoError, setGeoError] = React.useState(null);
    // Remove local satelliteMode state, use the one from parent
    // const [satelliteMode, setSatelliteMode] = React.useState(false);
    if (!property) return null;
    const imageSrc = property.imageUrl || property.image;

    // Extract property coordinates
    const getLatLng = (property) => {
      if (property.lat && property.lng) {
        return { lat: property.lat, lng: property.lng };
      }
      if (property.latitude && property.longitude) {
        return { lat: property.latitude, lng: property.longitude };
      }
      return { lat: null, lng: null };
    };
    const propertyCoords = getLatLng(property);
    const hasPropertyCoords =
      typeof propertyCoords.lat === "number" &&
      typeof propertyCoords.lng === "number" &&
      !isNaN(propertyCoords.lat) &&
      !isNaN(propertyCoords.lng);

    // Geocode if no coordinates
    React.useEffect(() => {
      if (!hasPropertyCoords && property.address) {
        setGeoLoading(true);
        fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/geocode?address=${encodeURIComponent(property.address)}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.lat && data.lng) {
              setGeoCoords({
                lat: data.lat,
                lng: data.lng,
              });
              setGeoError(null);
            } else {
              setGeoError("Location not found");
            }
          })
          .catch(() => setGeoError("Error fetching location"))
          .finally(() => setGeoLoading(false));
      }
    }, [
      property.address,
      hasPropertyCoords,
      propertyCoords.lat,
      propertyCoords.lng,
    ]);

    // Custom marker icon for Leaflet
    const markerIcon = new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    });

    let mapLatLng = null;
    if (hasPropertyCoords) {
      mapLatLng = { lat: propertyCoords.lat, lng: propertyCoords.lng };
    } else if (geoCoords) {
      mapLatLng = geoCoords;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] relative flex flex-col md:flex-row p-0 border border-gray-200 overflow-y-auto md:overflow-hidden min-h-[80vh] sm:min-h-[60vh] mx-2 sm:mx-auto">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-2 z-20"
            onClick={() => setShowPropertyMap(false)}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Left: Property name, image and details */}
          <div className="md:w-1/2 w-full flex flex-col items-center px-2 sm:px-4 py-4 md:py-6 border-b md:border-b-0 md:border-r border-gray-200 bg-white min-w-0 ">
            {/* Property name/title at the top, bold and large (smaller now, always visible) */}
            <div className="w-full flex flex-col items-center mb-4">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={property.title}
                  className="rounded-lg object-cover w-full max-w-[200px] sm:max-w-[260px] h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px]"
                  style={{ display: "block" }}
                />
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900  w-full text-center break-words truncate block mt-2">
              {property.title}
            </h2>
            {/* Property details */}
            <h4 className="text-[16px] font-semibold text-gray-900 mt-1 text-center ">
              {formatPrice(property.price)}
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700 text-sm mb-2 justify-center">
              {property.beds && (
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-blue-500" /> {property.beds} Beds
                </span>
              )}
              {property.baths && (
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-blue-500" /> {property.baths}{" "}
                  Baths
                </span>
              )}
              {property.sqft && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-blue-500" /> {property.sqft}{" "}
                  Sqft
                </span>
              )}
            </div>
            <p className="flex items-center text-gray-600 mb-2 justify-center text-xs break-words w-full">
              <MapPin className="h-4 w-4 mr-1 text-blue-500" />{" "}
              {property.address}
            </p>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 w-full max-w-[420px]">
              <h5 className="font-semibold mb-2 text-sm">Property Features</h5>
              <ul className="text-xs sm:text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Modern architecture
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Well ventilated spaces
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Premium fittings
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  24/7 security
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Smart home automation
                </li>
              </ul>
              <button
                className="mt-3 sm:mt-4 w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ maxWidth: "100%" }}
                onClick={() => alert("More Features Coming Soon!")}
              >
                More Features
              </button>
            </div>
          </div>
          {/* Right: Map and agent/actions */}
          <div className="md:w-1/2 flex flex-col px-8 py-4 bg-white">
            {/* Satellite toggle at the top of the right column */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSatelliteMode((prev) => !prev)}
                className="px-3 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-sm font-medium mr-2 md:mr-9 "
              >
                {satelliteMode ? "Disable Satellite" : "Enable Satellite"}
              </button>
            </div>
            <div className="relative bg-gray-100 rounded-lg h-[220px] sm:h-[300px] mb-4 flex items-center justify-center overflow-hidden w-full">
              {/* Map only, no satellite toggle here */}
              {mapLatLng ? (
                <MapContainer
                  center={mapLatLng}
                  zoom={16}
                  scrollWheelZoom={true}
                  style={{
                    height: "100%",
                    width: "100%",
                    minHeight: 300,
                    borderRadius: "0.5rem",
                  }}
                >
                  <TileLayer
                    url={
                      satelliteMode
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                    attribution={
                      satelliteMode
                        ? "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        : "&copy; OpenStreetMap contributors"
                    }
                  />
                  <Marker position={mapLatLng} icon={markerIcon}>
                    <Popup>
                      <b>Property Location</b>
                      <br />
                      {property.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : geoLoading ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                  <span className="animate-spin h-8 w-8 mb-2 border-4 border-blue-400 border-t-transparent rounded-full"></span>
                  <span>Locating area...</span>
                </div>
              ) : geoError ? (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 text-xs text-center px-2">
                  <MapPin className="h-8 w-8 mb-2" />
                  <span>{geoError}</span>
                  <span className="mt-2">
                    If you are using Microsoft Edge, try Chrome or Firefox. If
                    the problem persists, contact support.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                  <MapPin className="h-8 w-8 mb-2" />
                  <span>Unable to determine property location.</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-lg shadow-md z-10 text-sm">
                {property.address}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold mb-2">Contact Agent</h5>
                <div className="flex items-center gap-3">
                  <img
                    src="https://lh3.googleusercontent.com/a/ACg8ocKx5A65wkWPMYl6LbV6D7cxBor8zotHARn6T_oMMTWlMxN58ZjQ=s96-c"
                    alt="Vasudev Sharma"
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 border border-gray-300"
                  />
                  <div>
                    <p className="font-medium">Vasudev Sharma</p>
                    <p className="text-sm text-gray-600">+91 80177 90952</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 gap-2">
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  onClick={() => handleScheduleVisit(property)}
                >
                  Schedule a Visit
                </button>
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                  onClick={handleAdvancePayment}
                >
                  Advance Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ViewToggle = () => (
    <div className="flex justify-end">
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
        <button
          className={`p-2 rounded-md ${
            viewMode === "split" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setViewMode("split")}
          title="Split View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
        </button>
        <button
          className={`p-2 rounded-md ${
            viewMode === "map" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setViewMode("map")}
          title="Map View"
        >
          <MapIcon size={20} />
        </button>
        <button
          className={`p-2 rounded-md ${
            viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"
          }`}
          onClick={() => setViewMode("list")}
          title="List View"
        >
          <List size={20} />
        </button>
      </div>
    </div>
  );

  const PropertyList = ({ properties, buttonColor }) => {
    if (properties.length <= 2) {
      return (
        <div className="flex flex-row justify-center gap-3">
          {properties.map((property) => (
            <PropertyCard
              key={getPropertyKey(property)}
              property={property}
              buttonColor={buttonColor}
              onAddToWishlist={handleAddToWishlist}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-3 xl:gap-4 justify-center">
        {properties.map((property) => (
          <PropertyCard
            key={getPropertyKey(property)}
            property={property}
            buttonColor={buttonColor}
            onAddToWishlist={handleAddToWishlist}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    );
  };

  const renderPropertyContent = () => {
    const properties = getActiveProperties();
    let buttonColor = "blue";
    if (activeSection === "rent") {
      buttonColor = "green";
    } else if (activeSection === "premium") {
      buttonColor = "purple";
    }

    const slidesPerViewAdjusted = Math.min(slidesPerView, properties.length);

    switch (viewMode) {
      case "map": {
        // Find the first property with valid coordinates
        const propertiesWithCoords = properties.filter((p) => {
          const lat = p.lat ?? p.latitude ?? null;
          const lng = p.lng ?? p.longitude ?? null;
          return (
            typeof lat === "number" &&
            typeof lng === "number" &&
            !isNaN(lat) &&
            !isNaN(lng)
          );
        });
        let mapLat = defaultMapCenter.lat;
        let mapLng = defaultMapCenter.lng;
        let mapTitle = "Sealdah, Kolkata";
        if (propertiesWithCoords.length > 0) {
          const prop = propertiesWithCoords[0];
          mapLat = prop.lat ?? prop.latitude;
          mapLng = prop.lng ?? prop.longitude;
          mapTitle = prop.title || prop.address || "Property Location";
        }
        return (
          <div className="mt-8">
            <div className="h-[70vh] w-full relative overflow-hidden">
              <PropertyMap
                lat={mapLat}
                lng={mapLng}
                title={mapTitle}
                isSatellite={satelliteMode}
              />
            </div>
          </div>
        );
      }
      case "list":
        return (
          <div className="mt-8">
            <PropertyList properties={properties} buttonColor={buttonColor} />
          </div>
        );
      case "split":
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeSection === "sale"
                  ? "Properties for Sale"
                  : activeSection === "rent"
                  ? "Properties for Rent"
                  : "Premium Properties"}
              </h2>
              <div className="flex gap-2">
                <button
                  className={`${activeSection}-prev bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10`}
                  type="button"
                  tabIndex={0}
                  aria-label="Previous"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className={`${activeSection}-next bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10`}
                  type="button"
                  tabIndex={0}
                  aria-label="Next"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={slidesPerViewAdjusted}
              navigation={{
                prevEl: `.${activeSection}-prev`,
                nextEl: `.${activeSection}-next`,
              }}
              pagination={{
                clickable: true,
                el: `.${activeSection}-pagination`,
              }}
              loop={properties.length > slidesPerViewAdjusted}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={2250}
              className="mb-8"
              onInit={(swiper) => {
                setTimeout(() => {
                  if (
                    swiper &&
                    swiper.params &&
                    swiper.params.navigation &&
                    swiper.navigation &&
                    typeof swiper.navigation.destroy === "function" &&
                    typeof swiper.navigation.init === "function" &&
                    typeof swiper.navigation.update === "function"
                  ) {
                    swiper.navigation.destroy();
                    swiper.navigation.init();
                    swiper.navigation.update();
                  }
                }, 0);
              }}
              onSlideChange={() => {
                const swiper = document.querySelector(".swiper")?.swiper;
                if (
                  swiper &&
                  swiper.navigation &&
                  typeof swiper.navigation.update === "function"
                ) {
                  swiper.navigation.update();
                }
              }}
              onResize={(swiper) => {
                if (
                  swiper.navigation &&
                  typeof swiper.navigation.update === "function"
                ) {
                  swiper.navigation.update();
                }
              }}
            >
              {properties.map((property) => (
                <SwiperSlide key={getPropertyKey(property)}>
                  <PropertyCard
                    property={property}
                    buttonColor={buttonColor}
                    onAddToWishlist={handleAddToWishlist}
                    onViewDetails={handleViewDetails}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div
              className={`${activeSection}-pagination flex justify-center mb-12`}
            ></div>
          </>
        );
    }
  };

  // Adjust price range when switching sections to ensure properties for rent are visible
  useEffect(() => {
    if (activeSection === "rent") {
      // 30,000 to 1,40,000
      setPriceRange([30000, 140000]);
      setBedroomRange([1, 5]);
      setBathroomRange([1, 5]);
      setAreaRange([500, 3000]);
    } else if (activeSection === "sale") {
      // 40,00,000 to 5,00,00,000
      setPriceRange([1000000, 50000000]);
      setBedroomRange([1, 5]);
      setBathroomRange([1, 5]);
      setAreaRange([500, 3000]);
    } else if (activeSection === "premium") {
      // 90,00,000 to 6,00,00,000
      setPriceRange([9000000, 60000000]);
      setBedroomRange([1, 5]);
      setBathroomRange([1, 5]);
      setAreaRange([500, 3000]);
    }
    // Optionally reset other filters if needed
  }, [activeSection]);

  const handleScheduleVisit = (property) => {
    setSelectedProperty(property);
    const notification_id = `NTF-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    notifyUser(
      `Scheduled a visit for ${property.title}`,
      property.title,
      property.image,
      notification_id
    ).then(() => {
      toast.success(`Scheduled a visit for ${property.title}`);
      refreshUnreadCount();
    });
    navigate("/visits", { state: { property } });
  };

  // Fetch wishlist from backend on mount and whenever SeeMore is loaded
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`)
      .then((res) => res.json())
      .then((data) => {
        setWishlist(Array.isArray(data) ? data : []);
      })
      .catch(() => setWishlist([]));
  }, []);

  // Open property details modal if redirected with property_id
  useEffect(() => {
    if (effectivePropertyId && propertyList.length > 0) {
      const found = propertyList.find(
        (p) =>
          String(p.property_id) === String(effectivePropertyId) ||
          String(p.id) === String(effectivePropertyId)
      );
      if (found) {
        setSelectedProperty(found);
        setShowPropertyMap(true);
      }
    }
  }, [effectivePropertyId, propertyList]);

  // Map View default center for Sealdah, Kolkata
  const defaultMapCenter = { lat: 22.5645, lng: 88.3639 };

  // Helper: Convert price to Indian metric system for speech (e.g., 5000000 -> '50 lakhs')
  function priceToIndianWords(price) {
    if (!price) return "N/A";
    let num = Number(String(price).replace(/[^\d]/g, ""));
    if (isNaN(num)) return price;
    if (num >= 10000000) {
      // Crores
      let crores = num / 10000000;
      if (crores % 1 === 0) return `${crores} crore${crores > 1 ? "s" : ""}`;
      return `${crores.toFixed(2)} crores`;
    } else if (num >= 100000) {
      // Lakhs
      let lakhs = num / 100000;
      if (lakhs % 1 === 0) return `${lakhs} lakh${lakhs > 1 ? "s" : ""}`;
      return `${lakhs.toFixed(2)} lakhs`;
    } else {
      return `₹ ${num.toLocaleString("en-IN")}`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-10">
        {/* Header section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Find Your Dream Property
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect place to call home with our extensive
            collection of properties for sale and rent.
          </p>
        </div>
        {/* Navigation tabs */}
        <div className="flex flex-wrap items-center justify-center mb-10">
          <div className="inline-flex p-1 bg-gray-100 rounded-lg">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === "sale"
                  ? "bg-white shadow-md text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setActiveSection("sale")}
            >
              For Sale
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === "rent"
                  ? "bg-white shadow-md text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setActiveSection("rent")}
            >
              For Rent
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === "premium"
                  ? "bg-white shadow-md text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={() => setActiveSection("premium")}
            >
              Premium
            </button>
          </div>
          <div className="flex justify-center w-full mt-4 lg:mt-0 lg:justify-end">
            <div className="flex items-center space-x-4">
              <FilterRangeComponent />
              <ViewToggle />
              {/* Refresh button removed as per user request */}
            </div>
          </div>
        </div>
        <form className="flex items-center max-w-lg mx-auto mt-4 mb-6">
          <label htmlFor="voice-search" className="sr-only">
            Search
          </label>
          <div className="relative w-full">
            <input
              type="text"
              id="voice-search"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 p-2.5"
              placeholder="Search for properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button
              type="button"
              className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                isListening
                  ? "text-red-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              onClick={toggleListening}
              aria-label={isListening ? "Stop listening" : "Start voice search"}
            >
              {isListening ? (
                <>
                  <MicrophonePulse />
                  <Mic className="w-5 h-5 relative z-10" />
                </>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Search
          </button>
        </form>
        {/* Render the appropriate view based on viewMode state */}
        {renderPropertyContent()}
        {/* Call to action section */}
        <div className="mt-16 py-10 px-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Find Your Perfect Home Today
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Our real estate experts are ready to help you find your dream
            property. Contact us now for personalized assistance.
          </p>
          <button
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            onClick={() => handleNavigation("contact")}
          >
            Contact Us
          </button>
        </div>
      </div>
      {/* Property Details Modal */}
      {showPropertyMap && selectedProperty && (
        <SimplePropertyMap property={selectedProperty} />
      )}
      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg relative w-full max-w-md max-h-[90vh] flex flex-col justify-center mx-2 sm:mx-auto overflow-y-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowPayment(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {/* Property title above image */}
            {/* Removed duplicate property title and image in payment modal */}
            <div className="mt-4">
              <Payment
                property_name={selectedProperty?.title}
                property_image_url={
                  selectedProperty?.imageUrl ||
                  selectedProperty?.image ||
                  selectedProperty?.propertyImage
                }
                imageUrl={
                  selectedProperty?.imageUrl ||
                  selectedProperty?.image ||
                  selectedProperty?.propertyImage
                }
                onClose={() => setShowPayment(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
