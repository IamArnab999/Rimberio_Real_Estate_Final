import React, { useState, useContext } from "react";
import { UserContext } from "../components/UserContext";

const Payment = ({
  property_name = "",
  property_image_url = "",
  imageUrl = "",
  onClose, // Add onClose prop for modal control
}) => {
  // Fallback: always use a valid image URL (from Azure Blob or a default)
  const resolvedPropertyImageUrl =
    imageUrl ||
    property_image_url ||
    (window.selectedProperty &&
      (window.selectedProperty.imageUrl ||
        window.selectedProperty.image ||
        window.selectedProperty.propertyImage)) ||
    "https://realestateblobstorage.blob.core.windows.net/projects/default-image.png"; // Final fallback to Azure Blob default image

  // If still null, show a message or fallback UI in the render
  // Fallbacks for required fields
  const resolvedPropertyName =
    property_name ||
    (window.selectedProperty && window.selectedProperty.title) ||
    "Unknown Property";

  const { user } = useContext(UserContext); // Get Firebase user
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // Create order on backend
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 50000, // Amount in INR paise (500.00 INR)
            customer: form,
          }),
        }
      );
      const order = await res.json();

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.RAZORPAY_KEY_ID || "rzp_test_21qMhrE6TFe5wH",
        amount: order.amount,
        currency: order.currency,
        name: "Real Estate Payment",
        description: "Advance Payment",
        order_id: order.id,
        handler: async function (response) {
          console.log("Razorpay handler response:", response);
          let paymentMethod = "";
          // Fetch payment details from Razorpay to get payment method
          try {
            const paymentDetailsRes = await fetch(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/payments/fetch-payment-details`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                }),
              }
            );
            if (paymentDetailsRes.ok) {
              const paymentDetails = await paymentDetailsRes.json();
              paymentMethod = paymentDetails.method || "";
            }
          } catch (err) {
            console.warn("Could not fetch payment method", err);
          }
          alert(
            "Payment successful! Payment ID: " + response.razorpay_payment_id
          );
          // 1. Verify payment and store in DB
          try {
            const verifyRes = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  firebase_uid: user?.uid, // Use real Firebase UID
                  user_email: form.email,
                  property_name: resolvedPropertyName,
                  imageUrl: resolvedPropertyImageUrl, // Always send a valid imageUrl
                  user_name: form.name,
                  phone: form.phone,
                  amount: parseFloat((order.amount / 100).toFixed(2)), // convert paise to INR for DB
                  currency: order.currency || "INR",
                  payment_method: paymentMethod,
                }),
              }
            );
            if (!verifyRes.ok) {
              const errMsg = await verifyRes.text();
              alert("Payment verification failed: " + errMsg);
              return;
            }
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
            return;
          }
          // 2. Send details to backend to generate and email invoice
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/payments/send-invoice`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...form,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                property_name: resolvedPropertyName,
                property_image_url: resolvedPropertyImageUrl,
                imageUrl: resolvedPropertyImageUrl, // Always send a valid imageUrl for invoice
                user_name: form.name,
                phone: form.phone,
                payment_method: paymentMethod,
              }),
            }
          );
        },
        prefill: {
          name: form.name,
          email: form.email,
        },
        notes: {
          address: form.address,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment. Please try again.");
    }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col md:flex-row overflow-hidden relative animate-fadeIn">
        {/* Close button */}
        <button
          className="absolute right-4 text-gray-400 text-2xl font-bold z-10 focus:outline-none hover:text-red-600"
          onClick={onClose}
          aria-label="Close payment modal"
        >
          &times;
        </button>
        {/* Left: Image & Info */}
        <div className="md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <div className="flex flex-col items-center w-full">
            <div className="mb-2 flex items-center gap-2">
              <img
                src="./assets/Others/Razor_Pay_Logo2.webp"
                alt="Advance Payment Logo"
                className="w-8 h-8"
              />
              <h2 className="text-2xl font-bold text-gray-800">
                Advance Payment
              </h2>
            </div>
            <img
              src={resolvedPropertyImageUrl}
              alt={resolvedPropertyName}
              className="w-36 h-36 object-cover rounded-xl shadow border mb-3 transition-transform duration-200 hover:scale-105"
              onError={(e) =>
                (e.target.src =
                  "https://realestateblobstorage.blob.core.windows.net/projects/default-image.png")
              }
            />
            <div className="text-lg font-semibold text-center text-blue-900 mb-1">
              {resolvedPropertyName}
            </div>
            <div className="text-xs text-gray-500 text-center">
              Powered by Razorpay
            </div>
          </div>
        </div>
        {/* Right: Form */}
        <div className="md:w-1/2 w-full flex flex-col justify-center p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Pay with Razorpay
                  <img
                    src="/assets/Others/Razor_Pay_Logo2.webp"
                    alt="Razorpay Logo"
                    className="w-8 h-7 ml-2"
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                  />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
