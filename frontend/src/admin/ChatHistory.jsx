import React, { useEffect, useState, useContext } from "react";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import { fetchChatHistory, clearChatHistory } from "../../../backend/utils/api";
import { UserContext } from "../components/UserContext";

const ChatHistory = () => {
  const { user } = useContext(UserContext); // Access user context
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let history;
        if (user?.role === "admin" || user?.role === "owner") {
          // Admin/owner: fetch all chat history (default to all, can add filter UI for type)
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/chat-history?role=${
              user.role
            }&type=all`
          );
          history = await res.json();
        } else if (user?.uid) {
          // Member: fetch only their own chat history
          const res = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/chat-history?firebase_uid=${user.uid}&role=member`
          );
          history = await res.json();
        } else {
          history = [];
        }
        setChatHistory(history);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setError("Failed to load chat history.");
      }
    };
    if (user?.uid && user?.role) fetchHistory();
  }, [user]);

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setChatHistory([]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
      setError("Failed to clear chat history.");
    }
  };

  // Use backend endpoints for export
  const exportJson = async () => {
    try {
      let url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/chat-history/export/json`;
      if (user?.role === "admin" || user?.role === "owner") {
        url += `?role=${user.role}&type=all`;
      } else if (user?.uid) {
        url += `?firebase_uid=${user.uid}&role=member`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export chat history as JSON");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "chat_history.json";
      link.click();
      setDropdownOpen(false);
    } catch (err) {
      setError("Failed to export chat history as JSON");
    }
  };

  const exportPdf = async () => {
    try {
      let url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/chat-history/export/pdf`;
      if (user?.role === "admin" || user?.role === "owner") {
        url += `?role=${user.role}&type=all`;
      } else if (user?.uid) {
        url += `?firebase_uid=${user.uid}&role=member`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export chat history as PDF");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "chat_history.pdf";
      link.click();
      setDropdownOpen(false);
    } catch (err) {
      setError("Failed to export chat history as PDF");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="p-6 flex-1 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-10">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-blue-700 tracking-tight">
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 21V9a2 2 0 0 0-2-2h-7V2l-4 4h-5a2 2 0 0 0-2 2v12" />
            </svg>
            Chat History
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md shadow transition-colors duration-150"
            >
              Clear Chat History
            </button>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow transition-colors duration-150"
              >
                Export
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10 border">
                  <button
                    onClick={exportJson}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-blue-50 rounded-t-md"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={exportPdf}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-md"
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-[70vh] w-full rounded-xl border bg-white p-6 overflow-auto shadow-lg">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : chatHistory.length === 0 ? (
            <p className="text-gray-500">No chat history found.</p>
          ) : (
            chatHistory.map((chat, index) => (
              <div
                key={index}
                className="mb-6 p-4 border rounded-lg bg-blue-50/50 hover:shadow transition-shadow duration-150"
              >
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(
                    chat.chat_time || chat.timestamp
                  ).toLocaleString() || "N/A"}
                </p>
                <p className="font-semibold text-gray-800 mb-1">
                  {chat.name ? `${chat.name} (${chat.role || ""}): ` : ""}
                  {chat.user_message || chat.userMessage}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium text-blue-700">Bot:</span>{" "}
                  {chat.bot_reply || chat.botReply}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {chat.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
