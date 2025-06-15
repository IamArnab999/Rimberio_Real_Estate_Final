import React, { useState, useContext, useEffect } from "react";
// Adjust the path if necessary
// import Sidebar from "../components/Sidebar";
import { passwordUpdate } from "../firebase/firebase.js"; // Import the password update function
import { UserContext } from "../components/UserContext";
import { updateEmailAddress } from "../firebase/firebase.js";
import { sendEmailVerification, verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from "../firebase/config.js";
function SettingPage() {
  const { user, updateUserProfile } = useContext(UserContext); // Access the updateUserProfile function
  // Initialize form fields with user context values on mount
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    user?.avatar || "/assets/Others/user.png"
  );
  const [activeTab, setActiveTab] = useState("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [productRecommendationsEnabled, setProductRecommendationsEnabled] =
    useState(true);
  const [orderUpdatesEnabled, setOrderUpdatesEnabled] = useState(true);
  const [promotionalEmailsEnabled, setPromotionalEmailsEnabled] =
    useState(false);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.name?.split(" ")[0] || "");
      setLastName(user.name?.split(" ").slice(1).join(" ") || "");
      setEmail(user.email || "");
      setProfilePicture(user.avatar || "/assets/Others/user.png");
    }
  }, [user]);

  const handleSaveChanges = async () => {
    const fullName = `${firstName} ${lastName}`;
    try {
      await updateUserProfile(fullName, profilePicture);
      // Defensive: Check for missing firebase_uid or email
      const firebase_uid = user.firebase_uid || user.uid;
      if (!firebase_uid || !email) {
        alert(
          "Profile update failed: Missing Firebase UID or email. Please log out and log in again, or contact support if the issue persists."
        );
        console.error("User context:", user);
        return;
      }
      const payload = {
        id: user.id, // assuming user object has id
        firebase_uid,
        first_name: firstName,
        last_name: lastName,
        email: email,
        image: profilePicture,
      };
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/update-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully!");
        // Update user context with new data
        updateUserProfile(fullName, profilePicture);
        // Dispatch a global event so other components can refresh
        window.dispatchEvent(new Event("userProfileUpdated"));
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.message || error?.toString() || "Failed to update profile.");
    }
  };
  const checkEmailVerification = async () => {
    try {
      if (!auth.currentUser) {
        alert("No authenticated user found. Please log in again.");
        return;
      }

      // Check if the user signed in with Google
      const providerId = auth.currentUser.providerData[0]?.providerId;
      console.log("Provider Data:", auth.currentUser.providerData); // Debug log
      if (providerId === "google.com") {
        alert("Your email is verified via Google Sign-In.");
        return;
      }

      // Reload user data to get the latest status
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        alert("Your email is verified!");
      } else {
        alert("Your email is not verified. Please check your inbox.");
        await sendEmailVerification(auth.currentUser);
      }
    } catch (error) {
      console.error("Error checking email verification status:", error);
      alert("Failed to check email verification status.");
    }
  };
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation password do not match.");
      return;
    }

    try {
      await passwordUpdate(newPassword); // Call Firebase function to update password
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please try again.");
    }
  };

  const handleSaveNotificationPreferences = () => {
    const preferences = {
      productRecommendations: productRecommendationsEnabled,
      orderUpdates: orderUpdatesEnabled,
      promotionalEmails: promotionalEmailsEnabled,
      securityAlerts: securityAlertsEnabled,
    };

    // Save preferences to the backend or local storage
    console.log("Notification Preferences Saved:", preferences);
    alert("Notification preferences updated successfully!");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}

      {/* Main content */}
      <div className="flex-1 p-4 pt-16 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">Settings</h1>
        </div>

        {/* Tabs Header */}
        <div className="grid grid-cols-3 max-w-full md:max-w-md gap-2 mb-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`py-2 px-4 border text-sm md:text-base rounded-t-md transition-colors duration-150 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              activeTab === "account"
                ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                : "bg-gray-100 text-gray-500 hover:bg-blue-100"
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-4 border text-sm md:text-base rounded-t-md transition-colors duration-150 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              activeTab === "notifications"
                ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                : "bg-gray-100 text-gray-500 hover:bg-blue-100"
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-2 px-4 border text-sm md:text-base rounded-t-md transition-colors duration-150 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              activeTab === "security"
                ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                : "bg-gray-100 text-gray-500 hover:bg-blue-100"
            }`}
          >
            Security
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "account" && (
          <div className="p-6 md:p-8 border rounded-xl mt-4 bg-white shadow-lg">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Account Settings</h2>
              <p className="text-sm md:text-lg text-gray-500">Manage your account information</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Form Fields */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block mb-1 text-sm md:text-lg text-gray-700 font-medium">First Name</label>
                    <input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="border p-2 md:p-3 w-full text-sm md:text-lg rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block mb-1 text-sm md:text-lg text-gray-700 font-medium">Last Name</label>
                    <input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="border p-2 md:p-3 w-full text-sm md:text-lg rounded focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 mb-4 flex items-center justify-center bg-gray-100 rounded-full border-2 border-blue-200 overflow-hidden shadow">
                  <img
                    src={profilePicture || "/assets/Others/user.png"}
                    alt="Profile picture"
                    className="w-full h-full object-cover object-center rounded-full"
                    style={{ aspectRatio: "1/1" }}
                  />
                </div>
                <label
                  htmlFor="profilePicture"
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer text-center text-sm md:text-base font-medium hover:bg-blue-200 transition-colors duration-150 shadow"
                >
                  Upload Picture
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("profilePicture", file);
                      formData.append("firebase_uid", user?.firebase_uid);
                      try {
                        const res = await fetch(
                          `${import.meta.env.VITE_BACKEND_URL}/api/users/upload-profile-picture`,
                          {
                            method: "POST",
                            body: formData,
                            credentials: "include",
                          }
                        );
                        const data = await res.json();
                        if (data.imageUrl) {
                          setProfilePicture(data.imageUrl);
                        } else {
                          alert("Failed to upload image.");
                        }
                      } catch (err) {
                        alert("Error uploading image.");
                      }
                    }
                  }}
                />
              </div>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-md font-semibold shadow transition-colors duration-150 mt-2"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 md:p-8 border rounded-xl mt-4 bg-white shadow-lg">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Notification Settings</h2>
              <p className="text-sm md:text-lg text-gray-500">Manage how you receive notifications</p>
            </div>
            {/* Notification Toggles */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-lg font-medium text-gray-700">Product Recommendations</p>
                  <p className="text-xs md:text-md text-gray-400">Receive notifications about recommended products</p>
                </div>
                <input
                  type="checkbox"
                  checked={productRecommendationsEnabled}
                  onChange={(e) => setProductRecommendationsEnabled(e.target.checked)}
                  className="transform scale-125 md:scale-150 cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-lg font-medium text-gray-700">Order Updates</p>
                  <p className="text-xs md:text-md text-gray-400">Get notified about order status changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={orderUpdatesEnabled}
                  onChange={(e) => setOrderUpdatesEnabled(e.target.checked)}
                  className="transform scale-125 md:scale-150 cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-lg font-medium text-gray-700">Promotional Emails</p>
                  <p className="text-xs md:text-md text-gray-400">Receive emails about deals and new products</p>
                </div>
                <input
                  type="checkbox"
                  checked={promotionalEmailsEnabled}
                  onChange={(e) => setPromotionalEmailsEnabled(e.target.checked)}
                  className="transform scale-125 md:scale-150 cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm md:text-lg font-medium text-gray-700">Security Alerts</p>
                  <p className="text-xs md:text-md text-gray-400">Get notified about security-related events</p>
                </div>
                <input
                  type="checkbox"
                  checked={securityAlertsEnabled}
                  onChange={(e) => setSecurityAlertsEnabled(e.target.checked)}
                  className="transform scale-125 md:scale-150 cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-md font-semibold shadow transition-colors duration-150 mt-6"
              onClick={handleSaveNotificationPreferences}
            >
              Save Preferences
            </button>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6 md:p-8 border rounded-xl mt-4 bg-white shadow-lg">
            <div className="mb-4 border-b pb-2">
              <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Security Settings</h2>
              <p className="text-sm md:text-lg text-gray-500">Manage your password and security options</p>
            </div>
            {/* Password Fields */}
            <div className="space-y-6">
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="currentPassword" className="block mb-1 text-sm md:text-lg w-full sm:w-1/3 text-gray-700 font-medium">Current Password</label>
                <div className="relative w-full sm:w-2/3">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="currentPassword"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-lg pr-10 text-center focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  {currentPassword && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="newPassword" className="block mb-1 text-sm md:text-lg w-full sm:w-1/3 text-gray-700 font-medium">New Password</label>
                <div className="relative w-full sm:w-2/3">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-lg pr-10 text-center focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {newPassword && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label htmlFor="confirmPassword" className="block mb-1 text-sm md:text-lg w-full sm:w-1/3 text-gray-700 font-medium">Confirm New Password</label>
                <div className="relative w-full sm:w-2/3">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg text-sm md:text-lg pr-10 text-center focus:ring-2 focus:ring-blue-200"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-md font-semibold shadow transition-colors duration-150 mt-6"
              onClick={handlePasswordChange}
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingPage;
