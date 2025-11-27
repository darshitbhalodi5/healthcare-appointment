import React from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message, Tooltip } from "antd";
const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  // logout funtion
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

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
          <div className="sidebar">
            <div className="logo">
              <h6 className="text-light" style={{ textAlign: "center", width: "100%" }}>MedRescue</h6>
              <hr />
            </div>
            <div className="menu">
              {SidebarMenu.map((menu) => {
                const isActive = location.pathname === menu.path;
                return (
                  <Tooltip title={menu.name} placement="right" key={menu.path}>
                    <Link to={menu.path} className={`menu-item ${isActive && "active"}`}>
                      <i className={menu.icon}></i>
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
            <div className="header">
              <div className="header-content" style={{ cursor: "pointer" }}>
                <Tooltip title="Notifications" placement="bottom">
                  <Badge
                    count={user && user.notifcation.length}
                    onClick={() => {
                      navigate("/notification");
                    }}
                  >
                    <i className="fa-solid fa-bell"></i>
                  </Badge>
                </Tooltip>

                <Tooltip title={user?.name || "Profile"} placement="bottom">
                  <Link to="/profile" className="profile-link">
                    <i className="fa-solid fa-user profile-icon"></i>
                    <span className="profile-text">{user?.name}</span>
                  </Link>
                </Tooltip>
              </div>
            </div>
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
