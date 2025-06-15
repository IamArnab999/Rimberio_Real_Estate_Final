import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Analytics from "../admin/Analytics";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(true); // Always show on page load
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [functionalEnabled, setFunctionalEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [analyticsCookie, setAnalyticsCookie] = useState(
    Cookies.get("analytics")
  );
  const [marketingCookie, setMarketingCookie] = useState(
    Cookies.get("marketing")
  );

  // Initialize state from cookies
  useEffect(() => {
    if (Cookies.get("cookieConsent") === "accepted") {
      setIsVisible(false);
      setAnalyticsEnabled(true);
      setFunctionalEnabled(true);
      setMarketingEnabled(true);
    } else {
      setAnalyticsEnabled(Cookies.get("analytics") === "enabled");
      setFunctionalEnabled(Cookies.get("functional") === "enabled");
      setMarketingEnabled(Cookies.get("marketing") === "enabled");
    }
    setAnalyticsCookie(Cookies.get("analytics"));
    setMarketingCookie(Cookies.get("marketing"));
  }, []);

  // Listen for cookie changes
  useEffect(() => {
    const onCookieConsentUpdated = () => {
      setAnalyticsCookie(Cookies.get("analytics"));
      setMarketingCookie(Cookies.get("marketing"));
    };
    document.addEventListener("cookieConsentUpdated", onCookieConsentUpdated);
    return () => {
      document.removeEventListener(
        "cookieConsentUpdated",
        onCookieConsentUpdated
      );
    };
  }, []);

  useEffect(() => {
    setShowAnalytics(analyticsCookie === "enabled");
  }, [analyticsCookie]);

  useEffect(() => {
    const GA_ID = import.meta.env.VITE_MEASUREMENT_ID;
    if (analyticsCookie === "enabled" && GA_ID) {
      if (!document.getElementById("ga-script")) {
        const script = document.createElement("script");
        script.id = "ga-script";
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        script.async = true;
        document.body.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", GA_ID);
      }
    } else {
      const gaScript = document.getElementById("ga-script");
      if (gaScript) gaScript.remove();
    }
    if (marketingCookie === "enabled") {
      // Load marketing pixels here
    }
  }, [analyticsCookie, marketingCookie]);

  if (!isVisible && !showSettings) return null;

  const handleAcceptAll = () => {
    setIsVisible(false);
    setShowSettings(false);

    setAnalyticsEnabled(true);
    setFunctionalEnabled(true);
    setMarketingEnabled(true);

    Cookies.set("analytics", "enabled", { expires: 365, path: "/" });
    Cookies.set("functional", "enabled", { expires: 365, path: "/" });
    Cookies.set("marketing", "enabled", { expires: 365, path: "/" });
    Cookies.set("cookieConsent", "accepted", { expires: 365, path: "/" });

    document.dispatchEvent(new Event("cookieConsentUpdated"));
    console.log("All cookies accepted");
  };

  const handleDenyAll = () => {
    setIsVisible(false);
    setShowSettings(false);

    setAnalyticsEnabled(false);
    setFunctionalEnabled(false);
    setMarketingEnabled(false);

    Cookies.set("analytics", "disabled", { expires: 365, path: "/" });
    Cookies.set("functional", "disabled", { expires: 365, path: "/" });
    Cookies.set("marketing", "disabled", { expires: 365, path: "/" });
    Cookies.set("cookieConsent", "custom", { expires: 365, path: "/" });

    document.dispatchEvent(new Event("cookieConsentUpdated"));
    console.log("All cookies denied");
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    setIsVisible(false);

    Cookies.set("analytics", analyticsEnabled ? "enabled" : "disabled", {
      expires: 365,
      path: "/",
    });
    Cookies.set("functional", functionalEnabled ? "enabled" : "disabled", {
      expires: 365,
      path: "/",
    });
    Cookies.set("marketing", marketingEnabled ? "enabled" : "disabled", {
      expires: 365,
      path: "/",
    });
    Cookies.set("cookieConsent", "custom", { expires: 365, path: "/" });

    document.dispatchEvent(new Event("cookieConsentUpdated"));
    console.log("Cookie settings saved");
  };

  return (
    <>
      {/* Cookie Consent Banner */}
      {isVisible && (
        <section className="fixed max-w-2xl p-4 mx-auto bg-white border border-gray-200 md:gap-x-4 left-1/2 transform -translate-x-1/2 bottom-0 dark:bg-gray-900 md:flex md:items-center dark:border-gray-700 rounded-t-lg shadow-lg z-[1000] sm:w-full">
          <div className="flex items-center gap-x-4">
            <span className="inline-flex p-2 text-blue-500 rounded-lg shrink-0 dark:bg-gray-800 bg-blue-100/80">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.9803 8.5468C17.5123 8.69458 17.0197 8.7931 16.5271 8.7931C14.2118 8.76847 12.3399 6.89655 12.3153 4.58128C12.3153 4.13793 12.3892 3.69458 12.537 3.27586C11.9951 2.68473 11.6995 1.92118 11.6995 1.13301C11.6995 0.812808 11.7488 0.492611 11.8473 0.172414C11.2315 0.0738918 10.6158 0 10 0C4.48276 0 0 4.48276 0 10C0 15.5172 4.48276 20 10 20C15.5172 20 20 15.5172 20 10C20 9.77833 20 9.55665 19.9754 9.33498C19.2611 9.26108 18.5468 8.99015 17.9803 8.5468Z"
                  fill="currentColor"
                />
              </svg>
            </span>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              We use cookies to ensure that we give you the best experience on
              our website.{" "}
              <a
                href="#"
                className="text-blue-500 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPolicyModal(true);
                }}
              >
                Read cookies policies
              </a>
              .
            </p>
          </div>

          <div className="flex items-center mt-6 gap-x-4 shrink-0 lg:mt-0">
            <button
              className="w-1/2 text-xs text-gray-800 underline transition-colors duration-300 md:w-auto dark:text-white dark:hover:text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowSettings(true)}
            >
              Cookie Settings
            </button>

            <button
              className="text-xs w-1/2 md:w-auto font-medium bg-gray-800 rounded-lg hover:bg-gray-700 text-white px-4 py-2.5 duration-300 transition-colors focus:outline-none"
              onClick={handleAcceptAll}
            >
              Accept All Cookies
            </button>

            <button
              className="text-xs w-1/2 md:w-auto font-medium bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 px-4 py-2.5 duration-300 transition-colors focus:outline-none"
              onClick={handleDenyAll}
            >
              Reject All
            </button>
          </div>
        </section>
      )}

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 md:p-8 relative animate-fade-in-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl focus:outline-none"
              onClick={() => setShowSettings(false)}
              aria-label="Close cookie settings"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              Cookie Settings
            </h2>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition hover:shadow-sm">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="accent-blue-600 w-5 h-5"
                />
                <span className="text-gray-800 dark:text-gray-200 text-base">
                  Enable Analytics Cookies
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition hover:shadow-sm">
                <input
                  type="checkbox"
                  checked={functionalEnabled}
                  onChange={(e) => setFunctionalEnabled(e.target.checked)}
                  className="accent-blue-600 w-5 h-5"
                />
                <span className="text-gray-800 dark:text-gray-200 text-base">
                  Enable Functional Cookies
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition hover:shadow-sm">
                <input
                  type="checkbox"
                  checked={marketingEnabled}
                  onChange={(e) => setMarketingEnabled(e.target.checked)}
                  className="accent-blue-600 w-5 h-5"
                />
                <span className="text-gray-800 dark:text-gray-200 text-base">
                  Enable Marketing Cookies
                </span>
              </label>
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-3 mt-4">
              <button
                className="w-full md:w-auto px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-2xl w-full p-6 rounded-lg overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">Cookie Policy</h2>
            <p className="mb-2">
              This Cookie Policy explains what cookies are, how we use them, and
              your choices regarding their use.
            </p>
            <h3 className="text-md font-semibold mt-4 mb-1">
              What Are Cookies?
            </h3>
            <p className="mb-2">
              Cookies are small text files stored on your device when you visit
              a website. They help improve your experience and enable site
              functionality.
            </p>
            <h3 className="text-md font-semibold mt-4 mb-1">
              How We Use Cookies
            </h3>
            <ul className="list-disc ml-5 mb-2">
              <li>
                <strong>Necessary cookies:</strong> Essential for site
                functionality.
              </li>
              <li>
                <strong>Analytics cookies:</strong> Help us understand website
                usage.
              </li>
              <li>
                <strong>Marketing cookies:</strong> Used to deliver personalized
                advertisements.
              </li>
              <li>
                <strong>Functional cookies:</strong> Enable extra features and
                preferences.
              </li>
            </ul>
            <h3 className="text-md font-semibold mt-4 mb-1">Your Choices</h3>
            <p className="mb-2">
              You can choose to accept or reject cookies at any time via the
              Cookie Settings. Disabling certain types may affect your
              experience.
            </p>
            <div className="flex justify-end mt-6">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setShowPolicyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && <Analytics />}
    </>
  );
};

export default CookieConsent;
