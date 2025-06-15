const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const geminiChatURL = `${backendURL}/api/gemini-chat`;
const chatHistoryURL = `${backendURL}/api/chat-history`;
const uploadProfilePictureURL = `${backendURL}/api/users/upload-profile-picture`;

// Send a message to Gemini chat API
export const sendMessage = async (newMessage, user) => {
  try {
    const response = await fetch(geminiChatURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage, user }),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch Gemini response");
    const data = await response.json();
    // Return as { botReply: ... } for frontend compatibility
    return { botReply: data.reply };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Send message and fetch updated chat history for a user
export const loadAndSendMessage = async (newMessage, user) => {
  try {
    const { botReply } = await sendMessage(newMessage, user);
    // Save the message and bot reply to chat history
    // Format chat_time as 'YYYY-MM-DD HH:MM:SS' for MySQL
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const chat_time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    await fetch(chatHistoryURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        firebase_uid: user.uid,
        name: user.name || "Guest",
        role: user.role || "user",
        chat_time,
        user_message: newMessage,
        bot_message: botReply,
      }),
    });
    // Now fetch the updated chat history
    const chatHistory = await fetchChatHistory(user.uid);
    return { botReply, chatHistory };
  } catch (error) {
    console.error("Error in loadAndSendMessage:", error);
    throw error;
  }
};

// Fetch chat history for a specific user
export const fetchChatHistory = async (firebase_uid) => {
  console.log("Fetching chat history from backend...", firebase_uid); // Log the fetch attempt
  try {
    // Pass firebase_uid as query param if provided
    const url = firebase_uid ? `${chatHistoryURL}?firebase_uid=${firebase_uid}` : chatHistoryURL;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    console.log("Response status:", response.status); // Log response status
    console.log("Response from backend (GET):", response); // Log the raw response

    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    const data = await response.json();
    console.log("Fetched chat history:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

// Clear chat history for a specific user
export const clearChatHistory = async (user_id) => {
  try {
    const response = await fetch(chatHistoryURL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id }),
    });
    if (!response.ok) throw new Error("Failed to clear chat history");
  } catch (error) {
    console.error("Error clearing chat history:", error);
    throw error;
  }
};

// Upload a profile picture for the current user
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  try {
    const response = await fetch(uploadProfilePictureURL, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to upload profile picture");
    const data = await response.json();
    return data.imageUrl; // The backend should return { imageUrl: "/uploads/filename.jpg" }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};


export default backendURL;