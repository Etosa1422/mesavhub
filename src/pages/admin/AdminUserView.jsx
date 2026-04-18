"use client"; // optional in React + Vite

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserDetailsCard from "./UserDetailsCard"; // adjust path as needed
import { getUserById } from "../../services/adminService"; // adjust path as needed

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get user ID from URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(id);
        setUser(userData.data); // or userData, depending on your API response
      } catch (err) {
        setError(err.message || "Failed to fetch user.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleCopyApiKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      alert("API Key copied!"); // or use a toast library like react-hot-toast
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      // await toggleUserStatus(userId);
      // optionally re-fetch user
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
        <p className="ml-4 text-green-600 font-semibold">Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <p className="text-lg font-semibold">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-green-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg font-semibold text-gray-700">User not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-green-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Users
      </button>

      <UserDetailsCard
        user={user}
        onClose={() => navigate(-1)}
        onCopyApiKey={handleCopyApiKey}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
