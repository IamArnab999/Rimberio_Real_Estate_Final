import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "./UserContext";

const UpdateProfileForm = () => {
  const { user, updateUserProfile } = useContext(UserContext);
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const frontend =
    import.meta.env.REACT_APP_FRONTEND_URL || "http://localhost:5173";

  // Initialize fields from user context
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhotoURL(user.avatar || "/assets/Others/user.png");
      setEmail(user.email || "");
    }
  }, [user]);

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      formData.append("firebase_uid", user?.firebase_uid || user?.uid);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/upload-profile-picture`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.imageUrl) {
        setPhotoURL(data.imageUrl);
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit: update Firebase, then backend, then context
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("No user found in context.");
      return;
    }
    const firebase_uid = user.firebase_uid || user.uid;
    if (!firebase_uid || !email) {
      alert("Profile update failed: Missing Firebase UID or email.");
      console.error("Missing values:", { firebase_uid, email, user });
      return;
    }
    let emailChanged = email !== user.email;
    let firebaseEmailUpdated = false;
    // Update Firebase profile and backend
    try {
      if (emailChanged) {
        try {
          await updateUserProfile(name, photoURL, email); // updateUserProfile should update Firebase email
          firebaseEmailUpdated = true;
        } catch (firebaseError) {
          if (
            firebaseError.message &&
            firebaseError.message.includes("verify the new email")
          ) {
            alert(
              "To change your email, you must first verify the new email address. Please check your inbox for a verification email from Firebase, verify your new email, then try again."
            );
            return;
          } else {
            alert(
              firebaseError.message || "Failed to update email in Firebase."
            );
            return;
          }
        }
      } else {
        await updateUserProfile(name, photoURL, email); // update name/photo only
      }
      // Now update backend user_settings
      const [firstName, ...lastArr] = name.trim().split(" ");
      const lastName = lastArr.join(" ");
      const payload = {
        firebase_uid,
        first_name: firstName || null,
        last_name: lastName || null,
        email: email,
        image: photoURL || null,
      };
      console.log("Sending profile update payload:", payload);
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
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      alert(error.message || "Failed to update profile.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter your name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Photo URL
        </label>
        <input
          type="text"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter photo URL or upload below"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter your email"
        />
        {email !== user?.email && (
          <div className="text-xs text-yellow-600 mt-1">
            If you change your email, you must verify the new address before it
            can be updated. You will receive a verification email from Firebase.
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Upload Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleProfilePictureUpload}
          disabled={uploading}
          className="w-full px-3 py-2 border rounded"
        />
        {uploading && (
          <div className="text-blue-500 text-sm mt-2">Uploading...</div>
        )}
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        disabled={uploading}
      >
        Update Profile
      </button>
      {email !== user?.email && (
        <div className="text-xs text-yellow-700 mt-2">
          <strong>Note:</strong> After submitting, check your new email for a
          verification link. You must verify before the email change is applied.
        </div>
      )}
    </form>
  );
};

export default UpdateProfileForm;
