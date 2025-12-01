import React, { useState, useRef, useEffect } from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message, Tooltip, Modal } from "antd";
const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  // logout funtion
  const handleLogout = () => {
    Modal.confirm({
      title: "Logout?",
      content: "Are you sure you want to logout?",
      okText: "Yes, Logout",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: () => {
        localStorage.clear();
        message.success("Logout Successfully");
        navigate("/login");
      },
    });
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // =========== doctor menu ===============
  const doctorMenu = [
    {
      name: "Home",
      path: "/home",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Patients",
      path: "/doctor-patients",
      icon: "fa-solid fa-user-group",
    },
    {
      name: "Notifications",
      path: "/notification",
      icon: "fa-solid fa-bell",
    },

    {
      name: "Profile",
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user",
    },
  ];
  // =========== doctor menu ===============

  // redering menu list
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;
  return (
    <>
      <div className="main">
        <div className="layout">
          {/* Top Header for Mobile */}
          <div className="mobile-header">
            <div className="mobile-header-content">
              <div className="hospital-name">MedRescue Hospitals</div>
              <div className="profile-icon-container" ref={profileDropdownRef}>
                <button
                  className="profile-icon-link"
                  onClick={toggleProfileDropdown}
                  type="button"
                >
                  <i className="fa-solid fa-user"></i>
                </button>
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-avatar">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div className="profile-name">
                        <h4>
                          {user?.firstName} {user?.lastName}
                        </h4>
                        <p className="profile-role">
                          {user?.isDoctor
                            ? "Doctor"
                            : user?.isAdmin
                            ? "Admin"
                            : "Patient"}
                        </p>
                      </div>
                    </div>
                    <div className="profile-dropdown-body">
                      <div className="profile-info-item">
                        <i className="fa-solid fa-envelope"></i>
                        <span>{user?.email || "N/A"}</span>
                      </div>
                      <div className="profile-info-item">
                        <i className="fa-solid fa-phone"></i>
                        <span>{user?.mobileNumber || "N/A"}</span>
                      </div>
                      <div className="profile-info-item">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>{user?.address || "N/A"}</span>
                      </div>
                    </div>
                    <div className="profile-dropdown-footer">
                      <Link
                        to={
                          user?.isDoctor
                            ? `/doctor/profile/${user?._id}`
                            : `/profile`
                        }
                        className="profile-view-link"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <i className="fa-solid fa-id-card"></i>
                        View Full Profile
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                const isNotificationLink = menu.path === "/notification";
                const isProfileLink = menu.name === "Profile";
                return (
                  <Tooltip title={menu.name} placement="right" key={menu.path}>
                    <Link
                      to={menu.path}
                      className={`menu-item ${isActive ? "active" : ""} ${
                        isNotificationLink ? "notification-item" : ""
                      } ${isProfileLink ? "profile-menu-item" : ""}`}
                    >
                      {isNotificationLink ? (
                        <Badge
                          count={user?.notifcation?.length || 0}
                          size="small"
                          offset={[-4, 6]}
                        >
                          <i className={menu.icon}></i>
                        </Badge>
                      ) : (
                        <i className={menu.icon}></i>
                      )}
                      <span className="menu-text">{menu.name}</span>
                    </Link>
                  </Tooltip>
                );
              })}
              <Tooltip title="Logout" placement="right">
                <div className={`menu-item`} onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i>
                  <span className="menu-text">Logout</span>
                </div>
              </Tooltip>
            </div>
          </div>
          <div className="content">
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
