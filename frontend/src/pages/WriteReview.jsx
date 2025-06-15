import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../components/UserContext";

const WriteReview = ({ isOpen, toggleModal, onReviewSubmit }) => {
  const { user } = useContext(UserContext);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Handle file upload for images only and upload to Azure Blob
  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const validFiles = [];
    for (const file of uploadedFiles) {
      if (file.type.startsWith("image/")) {
        // Upload to Azure Blob Storage
        const formData = new FormData();
        formData.append("image", file);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/reviews/upload-image`,
            {
              method: "POST",
              body: formData,
            }
          );
          if (!res.ok) throw new Error("Failed to upload image");
          const { imageUrl } = await res.json();
          validFiles.push({ file, imageUrl });
          toast.success("Image uploaded successfully!");
        } catch (err) {
          toast.error("Image upload failed");
        }
      } else {
        toast.error("Only image files are allowed.");
      }
    }
    setFiles((prev) => [...prev, ...validFiles]);
  };

  // Submit review with Azure image URLs
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error(
        "You must agree to the terms and conditions to submit the review."
      );
      return;
    }
    const imageUrls = files.map((f) => f.imageUrl);
    // Use real user data from context
    const firebase_uid = user?.firebase_uid || user?.uid || "";
    const avatar = user?.avatar || "/assets/Others/VERT_user.webp";
    const user_name =
      user?.name || user?.displayName || user?.email || "Anonymous";
    const reviewData = {
      firebase_uid,
      avatar,
      user_name,
      title,
      review,
      rating,
      images: imageUrls,
    };
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        }
      );
      if (!res.ok) throw new Error("Failed to submit review");
      toast.success("Review submitted!");
      toggleModal();
      if (onReviewSubmit) onReviewSubmit();
      setReview("");
      setRating(0);
      setTitle("");
      setFiles([]);
      setAgreeToTerms(false);
    } catch (err) {
      toast.error("Failed to submit review");
    }
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl p-4">
        <div className="relative rounded-lg bg-white shadow dark:bg-gray-800 max-h-screen overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add a review
              </h3>
            </div>
            <button
              onClick={toggleModal}
              className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="sr-only">Close modal</span>✕
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Rating */}
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  onClick={() => setRating(star)}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= rating
                      ? "text-yellow-300"
                      : "text-gray-300 dark:text-gray-500"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 20"
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
              ))}
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                {rating}.0 out of 5
              </span>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Review title
              </label>
              <input
                type="text"
                id="title"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Review description
              </label>
              <textarea
                id="description"
                rows={6}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <p className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Add real photos to help other customers{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  (Optional)
                </span>
              </p>
              <div className="flex w-full items-center justify-center">
                <label
                  htmlFor="dropzone-file"
                  className="dark:hover:bg-bray-800 flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pb-4 pt-4">
                    <svg
                      className="mb-2 h-6 w-6 text-gray-500 dark:text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Images only
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {/* Preview selected files */}
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((fileObj, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={
                        fileObj.imageUrl || URL.createObjectURL(fileObj.file)
                      }
                      alt="preview"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== idx));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="review-checkbox"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label
                htmlFor="review-checkbox"
                className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                By publishing this review you agree with the{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:underline dark:text-primary-500"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new Event("openTermsModal"));
                  }}
                >
                  terms and conditions
                </a>
                .
              </label>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Add review
              </button>
              <button
                type="button"
                onClick={toggleModal}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;
