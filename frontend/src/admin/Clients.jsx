import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../components/UserContext";
import { Search, Plus, X, Edit, Trash2, Flag } from "lucide-react";
import { fetchClients } from "../utils/api";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { shouldEnableDashboard } from "../utils/dashboard";

const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TextInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} className="w-full px-4 py-2 border rounded" />
  </div>
);

function AddUserModal({
  open,
  onClose,
  onSubmit,
  newUser,
  setNewUser,
  emailWarning,
}) {
  return (
    <Modal isOpen={open} title="Add New User" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Name"
            type="text"
            placeholder="Enter full name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={newUser.email}
            onChange={(e) => {
              const value = e.target.value;
              setNewUser({ ...newUser, email: value });
              if (value && !value.includes("@")) {
                emailWarning.set(
                  "Please enter a valid email address (must include @)"
                );
              } else {
                emailWarning.set("");
              }
            }}
          />
          {emailWarning.value && (
            <p className="text-red-500 text-xs mt-1">{emailWarning.value}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={newUser.role === "admin"}
                  onChange={() => setNewUser({ ...newUser, role: "admin" })}
                  className="mr-2"
                />
                Admin
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={newUser.role === "member"}
                  onChange={() => setNewUser({ ...newUser, role: "member" })}
                  className="mr-2"
                />
                Member
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add User
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UpdateUserModal({
  open,
  onClose,
  onSubmit,
  editableUser,
  setEditableUser,
}) {
  if (!editableUser) return null;
  return (
    <Modal isOpen={open} title="Update User" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(editableUser);
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Name"
            type="text"
            placeholder="Enter full name"
            value={editableUser.name || ""}
            onChange={(e) =>
              setEditableUser({ ...editableUser, name: e.target.value })
            }
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="Enter email address"
            value={editableUser.email || ""}
            onChange={(e) =>
              setEditableUser({ ...editableUser, email: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update User
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddClientModal({
  open,
  onClose,
  onSubmit,
  newClient,
  setNewClient,
  phoneWarning,
  emailWarning,
}) {
  return (
    <Modal isOpen={open} title="Add New Client" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Name"
            type="text"
            placeholder="Enter full name"
            value={newClient.name}
            onChange={(e) =>
              setNewClient({ ...newClient, name: e.target.value })
            }
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={newClient.email}
            onChange={(e) => {
              const value = e.target.value;
              setNewClient({ ...newClient, email: value });
              if (value && !value.includes("@")) {
                emailWarning.set(
                  "Please enter a valid email address (must include @)"
                );
              } else {
                emailWarning.set("");
              }
            }}
          />
          {emailWarning.value && (
            <p className="text-red-500 text-xs mt-1">{emailWarning.value}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              placeholder="Enter 10-digit phone number"
              className="w-full px-4 py-2 border rounded"
              value={newClient.phone}
              maxLength={10}
              pattern="\d{10}"
              onChange={(e) => {
                const rawValue = e.target.value;
                if (/[^0-9]/.test(rawValue)) {
                  phoneWarning.set("Please enter numbers only");
                } else {
                  phoneWarning.set("");
                }
                const digitsOnly = rawValue.replace(/\D/g, "");
                setNewClient({ ...newClient, phone: digitsOnly });
              }}
            />
            {phoneWarning.value && (
              <p className="text-red-500 text-xs mt-1">{phoneWarning.value}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded"
              value={newClient.type}
              onChange={(e) =>
                setNewClient({ ...newClient, type: e.target.value })
              }
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Client
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UpdateClientModal({
  open,
  onClose,
  onSubmit,
  editableClient,
  setEditableClient,
  emailWarning,
  phoneWarning,
}) {
  if (!editableClient) return null;
  return (
    <Modal isOpen={open} title="Update Client" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!editableClient.email.includes("@")) {
            emailWarning.set(
              "Please enter a valid email address (must include @)"
            );
            return;
          } else {
            emailWarning.set("");
          }
          if (!/^\d{10}$/.test(editableClient.phone || "")) {
            phoneWarning.set("Please enter a valid 10-digit phone number");
            return;
          } else {
            phoneWarning.set("");
          }
          const updatedClient = {
            ...editableClient,
            status: "Inactive",
            last_activity: new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " "),
          };
          onSubmit(editableClient.id, updatedClient);
          onClose();
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Name"
            type="text"
            placeholder="Enter full name"
            value={editableClient.name || ""}
            onChange={(e) =>
              setEditableClient({ ...editableClient, name: e.target.value })
            }
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={editableClient.email || ""}
            onChange={(e) =>
              setEditableClient({ ...editableClient, email: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Update Client
          </button>
        </div>
      </form>
    </Modal>
  );
}

// --- DeleteClientModal ---
function DeleteClientModal({ open, onClose, onConfirm }) {
  return (
    <Modal isOpen={open} title="Delete Client" onClose={onClose}>
      <div className="mb-6 text-gray-800 text-center">
        Do you want to remove this client/member?
      </div>
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={onConfirm}
        >
          Yes
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          No
        </button>
      </div>
    </Modal>
  );
}

// --- DeleteUserModal ---
function DeleteUserModal({ open, onClose, onConfirm }) {
  return (
    <Modal isOpen={open} title="Delete User" onClose={onClose}>
      <div className="mb-6 text-gray-800 text-center">
        Do you want to remove this user/member?
      </div>
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={onConfirm}
        >
          Yes
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          No
        </button>
      </div>
    </Modal>
  );
}

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [editableUser, setEditableUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("clients");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);
  const [editableClient, setEditableClient] = useState(null);
  const [phoneWarning, setPhoneWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { fetchToken, user, refreshUserRole } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "member",
  });
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
    type: "Buyer",
  });

  const emailWarningObj = {
    value: emailWarning,
    set: setEmailWarning,
  };
  const phoneWarningObj = {
    value: phoneWarning,
    set: setPhoneWarning,
  };

  const filteredClients = (clients || []).filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery))
  );
  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  const handleRoleChange = async (id, newRole) => {
    try {
      const member = teamMembers.find((member) => member.id === id);
      const updatedMember = {
        name: member.name,
        email: member.email,
        role: newRole,
      };
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedMember),
        }
      );
      if (!response.ok) throw new Error("Failed to update role");
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === id ? { ...member, role: newRole } : member
        )
      );
      // Broadcast role change event for real-time update
      if (user && user.email === member.email) {
        setTimeout(() => {
          window.dispatchEvent(new Event("roleChanged"));
        }, 500);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.email.includes("@")) {
      setEmailWarning("Please enter a valid email address (must include @)");
      return;
    } else {
      setEmailWarning("");
    }
    const newUserObject = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUserObject),
        }
      );
      if (!response.ok) throw new Error("Failed to add user");
      const addedUser = await response.json();
      setTeamMembers((prev) => [
        ...prev,
        {
          ...newUserObject,
          id: addedUser.id,
          name: addedUser.name,
          email: addedUser.email,
          role: addedUser.role,
          avatar: addedUser.avatar || "/assets/Others/user.png",
          joinedAt: new Date(),
          lastActive: new Date(),
        },
      ]);
      setIsAddUserModalOpen(false);
      setNewUser({ name: "", email: "", role: "member", avatar: "" });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${updatedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedUser),
        }
      );
      if (!response.ok) throw new Error("Failed to update user");
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === updatedUser.id ? { ...member, ...updatedUser } : member
        )
      );
      setIsUpdateUserModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.email.includes("@")) {
      setEmailWarning("Please enter a valid email address (must include @)");
      return;
    } else {
      setEmailWarning("");
    }
    const newClientObject = {
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      status: newClient.status,
      type: newClient.type,
      last_activity: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    if (!/^\d{10}$/.test(newClientObject.phone)) {
      setPhoneWarning("Please enter a valid 10-digit phone number");
      return;
    } else {
      setPhoneWarning("");
    }

    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newClientObject),
        }
      );
      if (!response.ok) throw new Error("Failed to add client");
      const addedClient = await response.json();
      setClients((prev) => [...prev, addedClient]);
      setIsAddClientModalOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        status: "Active",
        type: "Buyer",
      });
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleUpdateClient = async (id, updatedClient) => {
    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clients/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedClient),
        }
      );
      if (!response.ok) throw new Error("Failed to update client");
      setClients((prev) =>
        prev.map((client) =>
          client.id === id ? { ...client, ...updatedClient } : client
        )
      );
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clients/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete client");
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = await fetchToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");
      setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdateUserClick = (user) => {
    setEditableUser(user);
    setIsUpdateUserModalOpen(true);
  };

  // --- Delete Modal Logic ---
  const openDeleteClientModal = (client) => {
    setClientToDelete(client);
    setIsDeleteClientModalOpen(true);
  };

  const handleConfirmDeleteClient = async () => {
    if (clientToDelete) {
      await handleDeleteClient(clientToDelete.id);
      setIsDeleteClientModalOpen(false);
      setClientToDelete(null);
    }
  };

  // --- Delete User Modal Logic ---
  const openDeleteUserModal = (user) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (userToDelete) {
      await handleDeleteUser(userToDelete.id);
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
    }
  };

  const prevRole = React.useRef(user?.role);

  useEffect(() => {
    if (user?.role && prevRole.current && user.role !== prevRole.current) {
      toast.info(`You are now logged in as ${user.role.toLowerCase()}`);
    }
    prevRole.current = user?.role;
  }, [user?.role]);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClientsData();
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const token = await fetchToken();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        let mappedData = data.map((user) => ({
          ...user,
          joinedAt: user.joined_at,
          lastActive: user.last_active,
          avatar: user.avatar || user.image || "/assets/Others/user.png",
        }));
        // Check if dashboard should be enabled for team members
        const enableDashboard = await shouldEnableDashboard();
        if (enableDashboard) {
          mappedData = mappedData.map((user) =>
            user.role === "member" && !user.dashboard_enabled
              ? { ...user, dashboard_enabled: true }
              : user
          );
        }
        setTeamMembers(mappedData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsersData();
  }, []);

  // Listen for userProfileUpdated event and refresh team members
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Re-fetch team members when profile is updated
      const fetchUsersData = async () => {
        try {
          const token = await fetchToken();
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/users`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch users");
          const data = await response.json();
          const mappedData = data.map((user) => ({
            ...user,
            joinedAt: user.joined_at,
            lastActive: user.last_active,
            avatar: user.avatar || user.image || "/assets/Others/user.png",
          }));
          setTeamMembers(mappedData);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsersData();
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, [fetchToken]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - responsive: hidden on mobile, visible on md+ */}
      <div className="hidden md:block w-full md:w-auto">
        <Sidebar />
      </div>
      {/* Mobile menu button for sidebar (optional, if you want to add mobile sidebar later) */}
      {/* <button className="fixed top-4 left-4 z-30 flex flex-col items-center justify-center md:hidden w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 focus:outline-none" style={{ minWidth: 40, minHeight: 40 }} aria-label="Open sidebar menu">...</button> */}
      <div className="flex-1 space-y-6 animate-fade-in p-3 sm:p-4 md:p-6 max-w-full md:max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 mt-5 sm:mt-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
            Clients & Users
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 border-b border-gray-300 mb-2">
          <button
            className={`px-4 py-2 -mb-px font-medium rounded-t-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
              activeTab === "clients"
                ? "text-blue-700 border-b-2 border-blue-500 bg-white shadow"
                : "text-gray-400 hover:text-blue-400 bg-gray-100"
            }`}
            onClick={() => setActiveTab("clients")}
          >
            Clients
          </button>
          <button
            className={`px-4 py-2 -mb-px font-medium rounded-t-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm ${
              activeTab === "users"
                ? "text-blue-700 border-b-2 border-blue-500 bg-white shadow"
                : "text-gray-400 hover:text-blue-400 bg-gray-100"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Team
          </button>
        </div>
        {activeTab === "clients" ? (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 px-2 sm:px-5">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600">
                Client Members
              </h2>
              <button
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded shadow transition-colors duration-150 text-sm"
                onClick={() => setIsAddClientModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add Client</span>
              </button>
            </div>
            <div className="bg-white border-gray-300 shadow-lg rounded-xl">
              <div className="p-2 sm:p-4 border-b border-gray-300">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative w-full max-w-xs sm:max-w-sm">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      placeholder="Search clients..."
                      className="pl-10 bg-gray-100 border-gray-300 w-full py-2 rounded focus:ring-2 focus:ring-blue-200 text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Name
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Email
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Phone
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Status
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Type
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2">
                          Last Activity
                        </th>
                        <th className="text-gray-700 px-2 sm:px-4 py-2 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="hover:bg-blue-50 border-b border-gray-200 transition-colors duration-100"
                        >
                          <td className="font-medium px-2 sm:px-4 py-2">
                            {client.name}
                          </td>
                          <td className="px-2 sm:px-4 py-2">{client.email}</td>
                          <td className="px-2 sm:px-4 py-2">
                            {client.phone || "N/A"}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                client.status === "Active"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {client.status || "N/A"}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {client.type || "N/A"}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            {client.last_activity
                              ? new Date(client.last_activity)
                                  .toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false,
                                  })
                                  .replace(",", "")
                              : "N/A"}
                          </td>
                          <td className="text-right px-2 sm:px-4 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                title="Update"
                                className="p-1 rounded hover:bg-blue-100 text-blue-600"
                                onClick={() => {
                                  setEditableClient(client);
                                  setIsUpdateClientModalOpen(true);
                                }}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                title="Delete"
                                className="p-1 rounded hover:bg-red-100 text-red-600"
                                onClick={() => openDeleteClientModal(client)}
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                title="Report Us"
                                className="p-1 rounded hover:bg-yellow-100 text-yellow-500"
                              >
                                <Flag size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white text-black p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600">
                Team Members
              </h2>
              <button
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded shadow transition-colors duration-150 text-sm"
                onClick={() => setIsAddUserModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            </div>
            <div className="p-2 sm:p-4 border-b border-gray-300">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  placeholder="Search team members..."
                  className="pl-10 bg-gray-100 border-gray-300 w-full py-2 rounded focus:ring-2 focus:ring-blue-200 text-sm"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                <table className="min-w-full bg-white border border-gray-300 rounded text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="text-left px-2 sm:px-4 py-2 text-gray-700">
                        User
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 text-gray-700">
                        Role
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 text-gray-700">
                        Joined
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 text-gray-700">
                        Last Active
                      </th>
                      <th className="text-left px-2 sm:px-4 py-2 text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeamMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-blue-50 border-b border-gray-200 transition-colors duration-100"
                      >
                        <td className="flex items-center gap-2 px-2 sm:px-4 py-2">
                          <img
                            src={member.avatar || "/assets/Others/user.png"}
                            alt={member.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-blue-200 shadow"
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-xs sm:text-sm">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <select
                            id={`role-${member.id}`}
                            className="px-2 py-1 border rounded text-xs sm:text-sm focus:ring-2 focus:ring-blue-200"
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
                            disabled={member.role === "owner"}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          {member.lastActive
                            ? new Date(member.lastActive).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-2 sm:px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="Update"
                              className="p-1 rounded hover:bg-blue-100 text-blue-600"
                              onClick={() => handleUpdateUserClick(member)}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              title="Delete"
                              className="p-1 rounded hover:bg-red-100 text-red-600"
                              onClick={() => openDeleteUserModal(member)}
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              title="Report Us"
                              className="p-1 rounded hover:bg-yellow-100 text-yellow-500"
                            >
                              <Flag size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <AddUserModal
          open={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSubmit={handleAddUser}
          newUser={newUser}
          setNewUser={setNewUser}
          emailWarning={emailWarningObj}
        />
        <UpdateUserModal
          open={isUpdateUserModalOpen}
          onClose={() => setIsUpdateUserModalOpen(false)}
          onSubmit={handleUpdateUser}
          editableUser={editableUser}
          setEditableUser={setEditableUser}
        />
        <UpdateClientModal
          open={isUpdateClientModalOpen}
          onClose={() => setIsUpdateClientModalOpen(false)}
          onSubmit={handleUpdateClient}
          editableClient={editableClient}
          setEditableClient={setEditableClient}
          emailWarning={emailWarningObj}
          phoneWarning={phoneWarningObj}
        />
        <AddClientModal
          open={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onSubmit={handleAddClient}
          newClient={newClient}
          setNewClient={setNewClient}
          phoneWarning={phoneWarningObj}
          emailWarning={emailWarningObj}
        />
        <DeleteClientModal
          open={isDeleteClientModalOpen}
          onClose={() => setIsDeleteClientModalOpen(false)}
          onConfirm={handleConfirmDeleteClient}
        />
        <DeleteUserModal
          open={isDeleteUserModalOpen}
          onClose={() => setIsDeleteUserModalOpen(false)}
          onConfirm={handleConfirmDeleteUser}
        />
      </div>
    </div>
  );
};

export default Clients;
