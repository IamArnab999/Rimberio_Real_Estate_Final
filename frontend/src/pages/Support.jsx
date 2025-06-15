import React, { useState, useRef, useEffect, useContext } from "react";
import ReactModal from "react-modal";
// import Sidebar from "../components/Sidebar";
import { loadAndSendMessage } from "../../../backend/utils/api";
import { UserContext } from "../components/UserContext";
import { toast } from "react-toastify";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  X,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Emoji/frimousse list
const emojiList = [
  { label: "Very Happy", emoji: "😄" },
  { label: "Happy", emoji: "🙂" },
  { label: "Neutral", emoji: "😐" },
  { label: "Sad", emoji: "🙁" },
  { label: "Angry", emoji: "😡" },
];
function SupportTicketModal({
  isOpen,
  onClose,
  onSubmit,
  propertyName,
  setPropertyName,
  ticketMessage,
  setTicketMessage,
  creatingTicket,
  selectedEmoji,
  setSelectedEmoji,
}) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-lg p-6 max-w-md mx-auto mt-32 shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      ariaHideApp={false}
    >
      <h2 className="text-xl font-bold mb-4">Submit a Support Ticket</h2>
      <input
        type="text"
        placeholder="Property Name"
        value={propertyName}
        onChange={(e) => setPropertyName(e.target.value)}
        className="border rounded p-2 w-full mb-3"
      />
      <textarea
        placeholder="Describe your issue..."
        value={ticketMessage}
        onChange={(e) => setTicketMessage(e.target.value)}
        className="border rounded p-2 w-full h-24 mb-4"
      />
      <div className="mb-4">
        <p className="mb-2 font-medium">
          How did you feel about your support experience?
        </p>
        <div className="flex justify-center gap-3">
          {emojiList.map((item) => (
            <button
              key={item.label}
              className={`text-3xl transition-all ${
                selectedEmoji === item.emoji ? "scale-125" : "opacity-70"
              }`}
              onClick={() => setSelectedEmoji(item.emoji)}
              aria-label={item.label}
              type="button"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onSubmit}
          disabled={creatingTicket}
        >
          {creatingTicket ? "Submitting..." : "Submit"}
        </button>
      </div>
    </ReactModal>
  );
}

// FAQ data
const faqItems = [
  // Account & Profile
  {
    question: "How do I create an account?",
    answer:
      "Visit the sign-up page, provide your details, and verify your email to get started.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click on ‘Forgot Password’ on the login page and follow the instructions sent to your registered email.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Log in to your account, go to your profile settings, and make the necessary changes.",
  },
  // Property Listings

  {
    question: "Are there any fees for listing my property?",
    answer:
      "Basic listings are free. Premium or featured listings may incur additional charges.",
  },

  // Searching & Viewing
  {
    question: "How do I search and filter properties?",
    answer:
      "Use the search bar with location, price range, property type, and amenities filters to find suitable listings.",
  },
  {
    question:
      "How do I schedule a property viewing or contact the owner/agent?",
    answer:
      "Use the “Contact” or “Schedule Visit” button on the listing page to get in touch with the owner or agent.",
  },
  // Transactions & Security
  {
    question: "How are payments and transactions handled?",
    answer:
      "Payments are securely processed through verified payment gateways. We recommend using only official channels.",
  },
  {
    question: "How do I report a suspicious listing or user?",
    answer:
      "Use the “Report” button on the listing or contact our support team with relevant details.",
  },
];

export function Support() {
  const { user, fetchToken } = useContext(UserContext); // Access user context
  const [activeTab, setActiveTab] = useState("faq");
  const [propertyName, setPropertyName] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [messages, setMessages] = useState(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    return storedMessages
      ? JSON.parse(storedMessages)
      : [
          {
            id: 1,
            sender: "bot",
            message: "Hello! How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ];
  });
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const [expanded, setExpanded] = useState({});

  const toggleExpansion = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };
  const generateTicketNumber = () => {
    return "TICKET-" + Math.floor(100000 + Math.random() * 900000);
  };
  // const { fetchToken } = useContext(UserContext); // Add this to get the Firebase token

  // Open the ticket modal
  const openTicketModal = () => setShowTicketModal(true);
  const closeTicketModal = () => setShowTicketModal(false);

  // Submit support ticket (now includes emoji/feedback)
  const handleCreateTicket = async () => {
    if (!propertyName.trim() || !ticketMessage.trim() || !selectedEmoji) {
      toast.error("Please fill in all fields and select a reaction.");
      return;
    }
    setCreatingTicket(true);
    const ticketNumber = generateTicketNumber();
    try {
      const token = await fetchToken?.();
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/support-tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticketNumber,
            userName: user?.name || "Guest",
            userEmail: user?.email || "",
            avatar: user?.avatar || "/assets/Others/user.png",
            propertyName,
            message: ticketMessage,
            emoji: selectedEmoji,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create ticket");
      toast.success(`Support ticket created! Ticket No: ${ticketNumber}`);
      setPropertyName("");
      setTicketMessage("");
      setSelectedEmoji(null);
      closeTicketModal();
    } catch (err) {
      toast.error("Failed to create support ticket.");
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
    setNewMessage("");

    setIsTyping(true);

    try {
      // Ensure the user object has a valid name
      const userWithDefaultName = {
        ...user,
        name: user?.name || "Guest",
      };
      const { botReply } = await loadAndSendMessage(
        newMessage,
        userWithDefaultName
      ); // Pass user details
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        message: botReply,
        timestamp: new Date().toISOString(),
      };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      localStorage.setItem("chatMessages", JSON.stringify(finalMessages));
    } catch (error) {
      console.error("Error during message flow:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = () => {
    const initialMessages = [
      {
        id: 1,
        sender: "bot",
        message: "Hello! How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ];

    setMessages(initialMessages);
    localStorage.setItem("chatMessages", JSON.stringify(initialMessages));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mt-12 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 tracking-tight">
            Help &amp; Support
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="border rounded-xl p-6 bg-white shadow-lg">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab("faq")}
                  className={`px-4 py-2 rounded-t-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
                    activeTab === "faq"
                      ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                      : "bg-gray-100 text-gray-500 hover:bg-blue-100"
                  }`}
                >
                  FAQs
                </button>
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`px-4 py-2 rounded-t-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
                    activeTab === "contact"
                      ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                      : "bg-gray-100 text-gray-500 hover:bg-blue-100"
                  }`}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => setActiveTab("support")}
                  className={`px-4 py-2 rounded-t-md font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
                    activeTab === "support"
                      ? "bg-white border-b-2 border-blue-500 text-blue-700 shadow"
                      : "bg-gray-100 text-gray-500 hover:bg-blue-100"
                  }`}
                >
                  Support Tickets
                </button>
              </div>
              {activeTab === "faq" && (
                <div className="my-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border-b py-2">
                      <button
                        className="w-full flex justify-between items-center font-medium text-left"
                        onClick={() => toggleExpansion(index)}
                      >
                        <span>{item.question}</span>
                        {expanded[index] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <div
                        style={{
                          maxHeight: expanded[index] ? "160px" : "0px",
                          opacity: expanded[index] ? 1 : 0,
                          transition: "all 0.3s ease-in-out",
                        }}
                        className="overflow-hidden mt-2"
                      >
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "contact" && (
                <div className="grid gap-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <Mail className="h-10 w-10 text-primary mb-2" />
                      <h3 className="text-lg font-medium">Email Support</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        For general inquiries and non-urgent issues.
                      </p>
                      <p className="font-medium">
                        rimberio_services@hotmail.com
                      </p>
                      <p className="text-sm text-gray-600">
                        Response time: 24-48 hours
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <Phone className="h-10 w-10 text-primary mb-2" />
                      <h3 className="text-lg font-medium">Phone Support</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        For urgent issues requiring immediate assistance.
                      </p>
                      <p className="font-medium"> + 91 9875417275 / 8920441711</p>
                      <p className="text-sm text-gray-600">
                        Available: Mon-Fri, 9AM-5PM IST
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "support" && (
                <div className="my-4 text-center py-8">
                  <h3 className="text-xl font-medium mb-2">
                    Submit a Support Ticket
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create a support ticket for complex issues requiring
                    detailed assistance.
                  </p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={openTicketModal}
                  >
                    Create New Ticket
                  </button>
                  <SupportTicketModal
                    isOpen={showTicketModal}
                    onClose={closeTicketModal}
                    onSubmit={handleCreateTicket}
                    propertyName={propertyName}
                    setPropertyName={setPropertyName}
                    ticketMessage={ticketMessage}
                    setTicketMessage={setTicketMessage}
                    creatingTicket={creatingTicket}
                    selectedEmoji={selectedEmoji}
                    setSelectedEmoji={setSelectedEmoji}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="border rounded-xl h-[500px] flex flex-col overflow-hidden bg-white shadow-lg">
              <div className="p-4 border-b flex items-center justify-between bg-blue-50">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-700">
                    Support Chat
                  </h3>
                </div>
                <button
                  onClick={clearChat}
                  className="text-gray-500 hover:text-blue-700 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 space-y-4 overflow-hidden"
              >
                <div className="relative h-full">
                  <div className="absolute inset-0 overflow-y-auto hide-scrollbar flex flex-col gap-4 pr-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-3 shadow ${
                            msg.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-900 border border-blue-100"
                          }`}
                          style={{ wordBreak: "break-word" }}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-xl p-3 bg-blue-50 border border-blue-100">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                            <div
                              className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 border-t bg-white p-2">
                <div className="flex gap-2 items-center">
                  <textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border rounded-xl p-3 h-18 resize-none bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-200"
                    style={{ minHeight: "82px" }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow"
                    disabled={!newMessage.trim() || isTyping}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
