import { fetchToken } from "../components/UserContext"; // Ensure fetchToken is imported

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const fetchClients = async () => {
  const token = await fetchToken(); // Retrieve token from UserContext
  if (!token) {
    console.error("Token is null. Cannot proceed with API call.");
    return [];
  }
  console.log("Token:", token); // Log the token
  try {
    const response = await fetch(`${backendURL}/api/clients`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the header
      },
    });

    console.log("Response status:", response.status); // Log response status

    if (!response.ok) {
      const errorText = await response.text(); // Log the error response
      console.error("Error response:", errorText);
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    console.log("Fetched data:", data); // Log the fetched data
    return data;
  } catch (error) {
    console.error("Error in fetchData:", error);
    return [];
  }
};

// Fetch chat history for admin/owner (all) or member (own)
export const fetchChatHistory = async (firebase_uid, role) => {
  let url = `${backendURL}/api/chat-history`;
  if (role === "admin" || role === "owner") {
    url += `?role=${role}`;
  } else if (firebase_uid) {
    url += `?firebase_uid=${firebase_uid}&role=${role}`;
  }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

