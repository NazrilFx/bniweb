"use client";

import React, { useState, useEffect } from "react";

// Simulasi data users
const simulatedUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    isAdmin: false,
    created_at: "2025-04-10T08:15:30.000Z",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    isAdmin: false,
    created_at: "2025-04-12T10:20:45.000Z",
  },
  {
    id: "3",
    name: "Carol Lee",
    email: "carol.lee@example.com",
    isAdmin: false,
    created_at: "2025-04-15T14:05:10.000Z",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    isAdmin: false,
    created_at: "2025-04-18T16:50:00.000Z",
  },
  {
    id: "5",
    name: "Eva Brown",
    email: "eva.brown@example.com",
    isAdmin: true,
    created_at: "2025-04-20T09:30:25.000Z",
  },
];

export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (res.ok) {
          setUsers(data.user);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
     console.log(users)
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Daftar Users</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center"
            >
              <div className="w-20 h-20 mb-4 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              <p className="text-sm text-indigo-600 mb-2">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {user.isAdmin ? <b>Admin</b> : "User"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
