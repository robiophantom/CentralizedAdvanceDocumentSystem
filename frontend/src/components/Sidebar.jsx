import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaChartLine, 
  FaUpload, 
  FaSearch, 
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaUsers
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { getInitials } from "../utils/timeUtils";

export default function Sidebar({ theme = "green" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser } = useAuth();
  
  // Check if desktop on mount
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setIsOpen(true); // Always open on desktop
      }
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Color theme config
  const colors =
    theme === "red"
      ? {
          primary: "bg-red-600",
          primaryText: "text-red-600",
          hover: "hover:bg-red-50",
          active: "bg-red-600 text-white",
        }
      : {
          primary: "bg-green-600",
          primaryText: "text-green-600",
          hover: "hover:bg-green-50",
          active: "bg-green-600 text-white",
        };

  // Role-based navigation items
  const getNavItems = () => {
    const userRole = currentUser?.role || 'student';
    const baseItems = [
      { path: "/", label: "Dashboard", icon: FaChartLine, roles: ['student', 'faculty', 'admin'] },
      { path: "/search", label: "Search", icon: FaSearch, roles: ['student', 'faculty', 'admin'] },
    ];

    // Add upload for faculty and admin
    if (userRole === 'faculty' || userRole === 'admin') {
      baseItems.push({ path: "/upload", label: "Upload", icon: FaUpload, roles: ['faculty', 'admin'] });
    }

    // Add admin panel for admin only
    if (userRole === 'admin') {
      baseItems.push({ path: "/admin", label: "Admin Panel", icon: FaCog, roles: ['admin'] });
      baseItems.push({ path: "/admin/users", label: "User Management", icon: FaUsers, roles: ['admin'] });
    }

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle sidebar"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-3 rounded-lg ${colors.primary} text-white shadow-lg`}
      >
        <FaBars className="w-5 h-5" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen || isDesktop ? 0 : -256,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-40 lg:translate-x-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className={`text-3xl font-bold ${colors.primaryText}`}>
                  CADMS
                </h1>
                <p className="text-sm text-gray-600 mt-1">Documents Hub</p>
                {currentUser?.role && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {currentUser.role}
                  </p>
                )}
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`w-10 h-10 rounded-lg ${colors.primary} flex items-center justify-center text-white font-bold text-lg`}
              >
                C
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Collapse sidebar"
          >
            {isCollapsed ? (
              <FaChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <FaChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav role="navigation" className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => !isDesktop && setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? `${colors.active} shadow-md`
                          : `text-gray-700 ${colors.hover}`
                      }`
                    }
                    end={item.path === "/"}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        {currentUser && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${colors.primary} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                {getInitials(currentUser?.full_name || currentUser?.username || currentUser?.email)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {currentUser?.full_name || currentUser?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {currentUser?.role || 'student'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
