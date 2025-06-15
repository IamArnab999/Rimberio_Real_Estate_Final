import React, { useContext, useState } from "react";
import { UserContext } from "../components/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  createAccount,
  signInWithGoogle,
  passwordReset,
} from "../firebase/firebase.js";
import { toast } from "react-toastify";

const Signup = () => {
  const { login } = useContext(UserContext);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [role, setRole] = useState("User");
  // Use only hardcoded roles, no backend fetch
  const availableRoles = ["User", "Admin", "Owner"];
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Added for Google button
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false); // For password reset loading
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createAccount(formData.email, formData.password);
      toast.success("Account created successfully");
      navigate("/login", { state: { justLoggedIn: true } });
    } catch (error) {
      console.error("Error during account creation:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true); // Set Google loading state
    try {
      const userData = await signInWithGoogle();
      login(userData);
      if (userData.isNewUser) {
        toast.success("Welcome! Please complete your profile.");
      }
      navigate("/");
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      toast.error(error.message);
    } finally {
      setGoogleLoading(false); // Reset Google loading state
    }
  };

  const handlePasswordReset = async () => {
    const enteredEmail = prompt("Enter your email to reset your password:");
    if (!enteredEmail) {
      toast.warn("Email is required to reset the password.");
      return;
    }
    setResetLoading(true); // Start loading
    try {
      await passwordReset(enteredEmail);
      toast.success(
        <div>
          Password reset email sent! Please check your inbox.
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error(
        <div>
          Error sending password reset email: {error.message}
          <div className="w-full bg-red-200 rounded-full h-2.5 mt-2">
            <div className="bg-red-600 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      );
    } finally {
      setResetLoading(false); // End loading
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/assets/apartment/residence-2219972_1280.jpg')",
      }}
    >
      <div className="flex-grow flex justify-center items-center p-6 relative">
        <div className="bg-white/80 p-6 rounded-3xl shadow-lg w-[480px]">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-gray-800 font-serif">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-medium">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="checkbox"
                className="peer hidden "
                onChange={() => setShowPassword(!showPassword)}
              />
              {formData.password && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-gray-500 mt-4"
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

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition mb-4 font-medium"
              disabled={loading}
            >
              Sign Up
            </button>
          </form>
          {/* Divider with OR */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 shadow-sm"
              disabled={googleLoading}
            >
              {googleLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-gray-700"
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
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google Logo"
                    className="w-5 h-5"
                  />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
