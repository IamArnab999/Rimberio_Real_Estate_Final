import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  signIn,
  signInWithGoogle,
  passwordReset,
} from "../firebase/firebase.js";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // Added for Google button
  const [resetLoading, setResetLoading] = useState(false); // For password reset loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    const consent = Cookies.get("cookieConsent");
    if (consent !== "accepted") {
      toast.warn("Please accept cookies to log in.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      sessionStorage.setItem("isAuthenticated", "true"); // Set session flag on login
      toast.success("Logged in successfully");
      const from =
        location.state?.from?.pathname + (location.state?.from?.search || "") ||
        "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true); // Set Google loading state
    try {
      const userData = await signInWithGoogle();
      sessionStorage.setItem("isAuthenticated", "true"); // Set session flag on Google login
      Cookies.set("authToken", userData.token, { expires: 7 });
      if (userData.isNewUser) {
        toast.success("Welcome! Please complete your profile.");
      }
      const from =
        location.state?.from?.pathname + (location.state?.from?.search || "") ||
        "/";
      navigate(from, { replace: true });
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
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/assets/apartment/residence-2219972_1280.jpg')",
      }}
    >
      {/* Background Blur */}

      {/* Login Form */}
      <div className="relative bg-white/80 backdrop-blur-lg p-8 shadow-lg rounded-3xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-4 text-center text-gray-800 font-serif">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="checkbox"
              id="showPasswordToggle"
              className="peer hidden"
              onChange={() => setShowPassword(!showPassword)}
            />
            {password && (
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
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mx-auto"
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
              "Login"
            )}
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

        <p className="text-sm text-center mt-4">
          New to this site?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an Account
          </Link>
        </p>
        <p className="text-sm text-center mt-2">
          Forgot password?{" "}
          <button
            onClick={handlePasswordReset}
            id="resetPasswordLink"
            className="text-blue-600 hover:underline"
          >
            Reset Password
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
