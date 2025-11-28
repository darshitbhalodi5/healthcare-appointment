import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <header className="landing-header">
      <div className="landing-container">
        <div className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1>MedRescue Hospital</h1>
          </Link>
        </div>
        <nav className="nav-buttons">
          {!isLoginPage && !isRegisterPage && (
            <Link to="/login" className="btn-link">
              <span className="btn-text">LOGIN</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

