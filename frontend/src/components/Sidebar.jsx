import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ theme = "red" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Color theme config
  const colors =
    theme === "red"
      ? {
          primary: "bg-red-600",
          primaryText: "text-red-600",
          hover: "hover:bg-red-100",
          active: "bg-red-600 text-white",
        }
      : {
          primary: "bg-green-600",
          primaryText: "text-green-600",
          hover: "hover:bg-green-100",
          active: "bg-green-600 text-white",
        };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/upload", label: "Upload", icon: "⬆️" },
    { path: "/search", label: "Search", icon: "🔍" },
    { path: "/admin", label: "Admin Panel", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${colors.primary} text-white`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className={`${isCollapsed ? "hidden" : "block"}`}>
            <h1 className={`text-3xl font-bold ${colors.primaryText}`}>
              CADMS
            </h1>
            <p className="text-sm text-gray-600 mt-1">Documents Hub</p>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100"
            aria-label="Collapse sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isCollapsed
                    ? "M9 5l7 7-7 7"
                    : "M15 19l-7-7 7-7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav role="navigation" className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? colors.active
                        : `text-gray-700 ${colors.hover}`
                    }`
                  }
                  end={item.path === "/"}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
