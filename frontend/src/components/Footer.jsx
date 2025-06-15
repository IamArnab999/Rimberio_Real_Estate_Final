import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { subscribeToNewsletter } from "../firebase/firebase.js";
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const location = useLocation();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await subscribeToNewsletter(email);
      toast.success("Subscribed successfully!");
      setEmail("");
      // Dispatch a custom event to notify calendar to refresh
      window.dispatchEvent(new Event("calendarDataChanged"));
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-5000 bg-[#101820] text-white px-6 pt-12 pb-6 shadow-xl">
      <div className="container mx-auto max-w-7xl">
        {/* Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-gray-700 pb-10">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Join Our Newsletter
            </h2>
            <p className="text-gray-400 text-base">
              Get weekly updates, tips and resources on latest real estate
              trends with our 25+ years of experience, simplified for you.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="w-full max-w-xl flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-black text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-6 py-3 rounded-lg transition"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>

        {/* Main Footer */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mt-12">
          {/* Branding & Socials */}
          <div className="lg:w-1/3">
            <Link
              to="/"
              onClick={(e) => {
                if (location.pathname === "/") {
                  e.preventDefault();
                  handleScroll("home");
                }
              }}
              className="inline-block"
            >
              <img
                src="/assets/Others/VERT_logo.webp"
                alt="Logo"
                className="h-24 mb-4"
              />
            </Link>

            <div className="flex gap-4 mt-6">
              {["twitter", "instagram", "google", "linkedin"].map(
                (platform, idx) => (
                  <img
                    key={idx}
                    src={`/assets/social_media/logo${idx + 1}.svg`}
                    alt={`${platform}_logo`}
                    className="h-14 w-14 p-1.5 rounded-full cursor-pointer transition duration-200 hover:scale-110 hover:shadow-[0_0_16px_4px_rgba(0,255,255,0.7)]"
                  />
                )
              )}
            </div>

            <div className="mt-6 flex sm:flex-col md:flex-row gap-3  md:items-center sm:items-center ">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Google Play"
                className="h-12 w-auto max-w-[180px] object-contain cursor-pointer hover:opacity-90"
              />
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="h-8 w-auto max-w-[180px] object-contain cursor-pointer hover:opacity-90 mt-2 md:mb-2"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 text-base">
            {[
              {
                title: "Company",
                links: [
                  { name: "About Us", path: "/", scrollTo: "about" },
                  { name: "Careers", path: "/teams" },
                ],
              },
              {
                title: "More",
                links: [
                  { name: "For Investors", path: "/investors" },
                  { name: "Documentation", path: "/documentation" },
                  { name: "License", path: "/license" },
                ],
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", path: "/Support" },
                  { name: "Contact Us", path: "/", scrollTo: "contact" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { name: "Blog", path: "/discover" },
                  { name: "Tutorials", path: "/how_it_works" },
                ],
              },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-3 text-lg">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li
                      key={i}
                      className="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                    >
                      {/* Check if it's an object with path or just a string */}
                      {typeof link === "string" ? (
                        link
                      ) : link.scrollTo ? (
                        <Link
                          to={link.path}
                          state={{ scrollTo: link.scrollTo }}
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <Link to={link.path}>{link.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <button
            className="text-xs underline hover:text-teal-400 transition cursor-pointer bg-transparent border-none p-0"
            onClick={() => setShowPrivacy(true)}
            type="button"
          >
            Privacy Policy
          </button>
          <span className="hidden sm:inline">|</span>
          <button
            className="text-xs underline hover:text-teal-400 transition cursor-pointer bg-transparent border-none p-0"
            onClick={() => setShowTerms(true)}
            type="button"
          >
            Terms & Conditions
          </button>
        </div>

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white text-gray-900 max-w-2xl w-full rounded-2xl shadow-2xl p-0 relative flex flex-col animate-fade-in-up border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-teal-500 to-blue-500">
                <div className="flex items-center gap-2">
                  {/* Custom icon as per screenshot */}
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <line
                      x1="8"
                      y1="8"
                      x2="16"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="12"
                      x2="16"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="16"
                      x2="12"
                      y2="16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    Privacy Policy
                  </h2>
                </div>
                <button
                  className="text-white text-3xl font-bold hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowPrivacy(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {/* Content */}
              <div className="overflow-y-auto px-6 py-6 max-h-[70vh] text-base sm:text-lg">
                <p className="text-xs mb-2 text-gray-500">
                  Effective Date: 9th June, 2025
                </p>
                <p className="mb-4">
                  At <span className="font-semibold">Rimberio</span>, we value
                  your privacy. This Privacy Policy describes how we collect,
                  use, and protect your personal information.
                </p>
                <ol className="list-decimal ml-5 space-y-4">
                  <li>
                    <span className="font-semibold">
                      Information We Collect
                    </span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>
                        Personal Information: Name, email, phone number, address
                      </li>
                      <li>
                        Property Listings Data: Property details, pricing,
                        location
                      </li>
                      <li>
                        Usage Data: IP address, browser type, pages visited
                      </li>
                      <li>Cookies: For session tracking and preferences</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">
                      How We Use Your Information
                    </span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>To create and manage user accounts</li>
                      <li>To list and display properties</li>
                      <li>
                        To send updates or promotional offers (only with your
                        consent)
                      </li>
                      <li>To improve website functionality</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">
                      Sharing Your Information
                    </span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>
                        We do not sell your personal data. However, we may share
                        it:
                      </li>
                      <li>
                        With third-party service providers (e.g., hosting,
                        analytics)
                      </li>
                      <li>If required by law or to protect our rights</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Cookies</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      We use cookies to enhance user experience. You can disable
                      cookies in your browser settings.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">Data Security</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      We use secure technologies (SSL, encryption, firewalls) to
                      protect your data, but no method of transmission over the
                      Internet is 100% secure.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">Your Rights</span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>Access, correct, or delete your personal data</li>
                      <li>Opt out of marketing emails</li>
                      <li>
                        Contact us at{" "}
                        <a
                          href="mailto:support@example.com"
                          className="text-blue-600 underline"
                        >
                          support@example.com
                        </a>{" "}
                        for any privacy concerns
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">
                      Changes to This Policy
                    </span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      We may update this Privacy Policy. Changes will be posted
                      here with a new effective date.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions Modal */}
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-white text-gray-900 max-w-2xl w-full rounded-2xl shadow-2xl p-0 relative flex flex-col animate-fade-in-up border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-blue-500 to-teal-500">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 9V7a5 5 0 00-10 0v2M5 9h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9z"
                    />
                  </svg>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">
                    Terms & Conditions
                  </h2>
                </div>
                <button
                  className="text-white text-3xl font-bold hover:text-gray-200 focus:outline-none"
                  onClick={() => setShowTerms(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {/* Content */}
              <div className="overflow-y-auto px-6 py-6 max-h-[70vh] text-base sm:text-lg">
                <p className="text-xs mb-2 text-gray-500">
                  Effective Date: 9th June, 2025
                </p>
                <ol className="list-decimal ml-5 space-y-4">
                  <li>
                    <span className="font-semibold">Acceptance of Terms</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      Using our site means you agree to follow these terms and
                      any updates posted here.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">Use of the Website</span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>
                        You agree not to misuse the site for illegal or
                        unauthorized purposes.
                      </li>
                      <li>
                        You are responsible for any content you upload (e.g.,
                        property listings, comments).
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Intellectual Property</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      All content (text, images, logos, etc.) is owned by or
                      licensed to us. You may not copy or reuse any content
                      without permission.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">User Accounts</span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>
                        You must provide accurate information and keep your
                        credentials safe. We reserve the right to suspend any
                        account violating our terms.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Property Listings</span>
                    <ul className="list-disc ml-6 mt-1 text-sm sm:text-base">
                      <li>
                        Listings must be accurate and lawful. We are not
                        responsible for the accuracy of third-party listings.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Liability Disclaimer</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      We make no guarantees regarding the accuracy or
                      completeness of the content. We are not liable for any
                      loss or damage arising from your use of the site.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">Governing Law</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      These terms are governed by the laws of your
                      country/state.
                    </p>
                  </li>
                  <li>
                    <span className="font-semibold">Contact</span>
                    <p className="ml-1 mt-1 text-sm sm:text-base">
                      For questions or support:{" "}
                      <a
                        href="mailto:support@example.com"
                        className="text-blue-600 underline"
                      >
                        rimberio@outlook.com
                      </a>
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Rimberio Private Limited. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
