import { useState } from "react";
import { FiUser, FiMail, FiMessageSquare, FiEdit } from "react-icons/fi";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { app } from "../firebase/config.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const database = getDatabase(app);
  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.name.trim() ||
      formData.name.length < 2 ||
      !/^[A-Za-z\s]+$/.test(formData.name)
    ) {
      newErrors.name =
        "Name must be at least 2 characters and contain only letters";
    }

    if (
      !formData.email ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.subject.length > 100) {
      newErrors.subject = "Subject cannot exceed 100 characters";
    }

    if (!formData.message || formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (formData.message.length > 500) {
      newErrors.message = "Message cannot exceed 500 characters";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Save data to Firebase
  const saveToFirebase = async (name, email, subject, message) => {
    try {
      const contactRef = ref(database, "infos");
      const newContactRef = push(contactRef);

      await set(newContactRef, {
        name,
        email,
        subject,
        message,
      });
    } catch (error) {
      console.error("Error saving data to Firebase:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  // Simulate admin notification (in real apps, this would be an email or dashboard alert)
  const notifyAdmin = (formData) => {
    toast.info(
      `Admin notification: New contact from ${formData.name} (${formData.email}) - Subject: ${formData.subject}`,
      { autoClose: 8000 }
    );
  };

  // Send email to user and admin via backend API
  const sendEmails = async (formData) => {
    // Send mail to user
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendMail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: formData.email,
        subject: "Thank you for contacting us",
        text: `Thank you for messaging ${formData.name}, we will contact you shortly`,
        html: `
          <div style="background:linear-gradient(135deg,#e0e7ff 0%,#f8fafc 100%);padding:0;margin:0;min-height:100vh;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:18px;box-shadow:0 4px 24px #b6c1e0;overflow:hidden;">
              <div style="background:linear-gradient(90deg,#2563eb 0%,#1e40af 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                <h1 style="margin:0;font-size:2.1rem;letter-spacing:1px;">Thank you for contacting us!</h1>
                <p style="margin:16px 0 0 0;font-size:1.15rem;">We appreciate your message.</p>
              </div>
              <div style="padding:32px 24px 16px 24px;">
                <h2 style="color:#2563eb;font-size:1.35rem;margin-bottom:20px;">Hello, <span style='color:#1e40af;'>${
                  formData.name
                }</span>!</h2>
                <p style="font-size:1.08rem;color:#222;">We have received your message and will get back to you shortly.</p>
                <div style="margin:28px 0 0 0;font-size:0.97rem;color:#555;">Best regards,<br><b>Rimberio Real Estate Team</b></div>
              </div>
              <div style="background:#f1f5f9;color:#888;text-align:center;padding:18px 10px 12px 10px;font-size:1rem;border-radius:0 0 18px 18px;">
                <div style="margin-bottom:4px;">&copy; ${new Date().getFullYear()} <b>Rimberio Real Estate</b>. All rights reserved.</div>
              </div>
            </div>
          </div>`,
      }),
    });

    // Send mail to admin
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/sendMail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "rarnab225@gmail.com", // Admin email
        subject: "Someone has messaged you",
        text: `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\nMessage: ${formData.message}`,
        html: `
          <div style="background:linear-gradient(135deg,#fdf6e3 0%,#f8fafc 100%);padding:0;margin:0;min-height:100vh;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:18px;box-shadow:0 4px 24px #fbbf24;overflow:hidden;">
              <div style="background:linear-gradient(90deg,#fbbf24 0%,#f59e42 100%);color:#fff;padding:32px 24px 16px 24px;text-align:center;">
                <h1 style="margin:0;font-size:2.1rem;letter-spacing:1px;">New Contact Form Submission</h1>
                <p style="margin:16px 0 0 0;font-size:1.15rem;">You have a new message from the website.</p>
              </div>
              <div style="padding:32px 24px 16px 24px;">
                <h2 style="color:#d97706;font-size:1.25rem;margin-bottom:18px;">Contact Details</h2>
                <p style="font-size:1.08rem;color:#222;"><b>Name:</b> ${
                  formData.name
                }</p>
                <p style="font-size:1.08rem;color:#222;"><b>Email:</b> ${
                  formData.email
                }</p>
                <p style="font-size:1.08rem;color:#222;"><b>Subject:</b> ${
                  formData.subject
                }</p>
                <p style="font-size:1.08rem;color:#222;"><b>Message:</b><br>${
                  formData.message
                }</p>
                <div style="margin:28px 0 0 0;font-size:0.97rem;color:#555;">This is an automated notification for <b>rarnab225@gmail.com</b></div>
              </div>
              <div style="background:#fdf6e3;color:#b45309;text-align:center;padding:18px 10px 12px 10px;font-size:1rem;border-radius:0 0 18px 18px;">
                <div style="margin-bottom:4px;">&copy; ${new Date().getFullYear()} <b>Rimberio Real Estate Platform</b>. All rights reserved.</div>
              </div>
            </div>
          </div>`,
      }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      try {
        await saveToFirebase(
          formData.name,
          formData.email,
          formData.subject,
          formData.message
        );
        await sendEmails(formData); // Send emails to user and admin
        toast.success(
          "Thank you for contacting us! Your message has been sent."
        ); // User message
        notifyAdmin(formData); // Admin message (toast for demo)
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } catch (error) {
        toast.error("Error submitting form. Please try again.");
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form.");
    }
  };

  const isFormValid =
    formData.name.trim().length >= 2 &&
    /^[A-Za-z\s]+$/.test(formData.name) &&
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email) &&
    formData.message.trim().length >= 10;

  return (
    <div className="min-h-screen bg-white py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch justify-center">
          {/* Left: Contact Form */}
          <div className="flex-1 bg-white rounded-2xl shadow p-8 md:p-12 min-w-[300px] order-1 lg:order-none">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-blue-700 text-center tracking-tight">
              Contact Us
            </h2>
            <form className="space-y-7 md:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium text-gray-700"
                  >
                    <FiUser className="inline-block mr-2" /> Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-4 py-2 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    <FiMail className="inline-block mr-2" /> Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-4 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-lg font-medium text-gray-700"
                  >
                    <FiEdit className="inline-block mr-2" />
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium text-gray-700"
                  >
                    <FiMessageSquare className="inline-block mr-2" /> Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Type your message here..."
                    className={`mt-1 block w-full px-4 py-2 border ${
                      errors.message ? "border-red-300" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <div className="mt-1 flex justify-between">
                    {errors.message && (
                      <p className="text-sm text-red-600">{errors.message}</p>
                    )}
                    <span className="text-sm text-gray-500">
                      {formData.message.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3 px-6 rounded-md shadow-sm text-lg font-medium text-white ${
                    isFormValid && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </form>
          </div>
          {/* Right: Contact Info Card */}
          <div className="flex-1 bg-gray-50 rounded-2xl shadow p-8 md:p-16 flex flex-col justify-between min-w-[300px] max-w-md order-2 lg:order-none">
            <div className="mb-6 space-y-6">
              <div className="mb-6">
                <div className="font-semibold text-lg md:text-xl mb-1 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">📍</span> Visit our
                  office
                </div>
                <div className="text-gray-700 text-sm md:text-base ml-8">
                  13th Floor, Acropolis, 1858/1, Rajdanga Main Rd,
                  <br />
                  Kasba, Kolkata, West Bengal 700107
                </div>
              </div>
              <div className="mb-6">
                <div className="font-semibold text-lg md:text-xl mb-1 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">📞</span> Phone
                </div>
                <div className="text-gray-700 text-sm md:text-base ml-8">
                  +91 8767490102
                </div>
              </div>
              <div className="mb-6">
                <div className="font-semibold text-lg md:text-xl mb-1 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">✉️</span> Email
                </div>
                <div className="text-gray-700 text-sm md:text-base ml-8">
                  support_rimberio@outlook.com
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg md:text-xl mb-1 flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">⏰</span> Hour of
                  operation
                </div>
                <div className="text-gray-700 text-sm md:text-base ml-8">
                  Monday – Friday: 10:00AM – 8:00PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
