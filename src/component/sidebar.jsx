"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaPlusCircle,
  FaCogs,
  FaChevronDown,
  FaUsersCog,
  FaBoxes,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me"); // Fetch dari API Next.js
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [user, pathname, router, loading]);

  const toggleSubMenu = (e) => {
    e.preventDefault();
    setSubmenuOpen(!submenuOpen);
  };

  if (loading) {
    return null;
  }

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        window.location.reload(); // Reload the page after logout
        router.push("/login");
      } else {
        console.error("Logout failed:", res.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  if (!loading)
    return (
      <aside className="sidebar bg-gray-800 text-white">
        <div className="logo">
          <img
            src="https://via.placeholder.com/150x40?text=Company+Logo"
            alt="Company Logo"
          />
        </div>

        <ul className="nav-menu">
          {user ? (
            <>
              {/* Kalau user ADA */}
              <li className="nav-item">
                <a href="/" className="nav-link active">
                  <FaTachometerAlt /> Dashboard
                </a>
              </li>
              <li className="nav-item">
                <a href="/add-data" className="nav-link">
                  <FaPlusCircle /> Tambah Data
                </a>
              </li>

              {/* Master Menu */}
              {user.isAdmin && (
                <li className="nav-item">
                  <a href="#" className="nav-link" onClick={toggleSubMenu}>
                    <FaCogs /> Master
                    <FaChevronDown style={{ float: "right" }} />
                  </a>
                  {submenuOpen && (
                    <ul className="submenu" style={{ paddingLeft: "15px" }}>
                      <li>
                        <a href="/master/user" className="nav-link">
                          <FaUsersCog /> Kelola User
                        </a>
                      </li>
                      <li>
                        <a href="/master/machine" className="nav-link">
                          <FaBoxes /> Kelola mesin
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              <li className="nav-item">
                <a onClick={handleLogout} className="nav-link">
                  <FaSignOutAlt /> Logout
                </a>
              </li>
            </>
          ) : (
            <>
              {/* Kalau user NULL */}
              <li className="nav-item">
                <a href="/login" className="nav-link">
                  <FaSignInAlt /> Login
                </a>
              </li>
              <li className="nav-item">
                <a href="/signup" className="nav-link">
                  <FaUserPlus /> Sign Up
                </a>
              </li>
            </>
          )}
        </ul>
      </aside>
    );
}
