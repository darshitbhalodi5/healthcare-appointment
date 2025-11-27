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
            <h1>MedRescue</h1>
          </Link>
        </div>
        <nav className="nav-buttons">
          {!isLoginPage && (
            <Link to="/login" className="btn-link">
              <i className="fa-solid fa-right-to-bracket"></i>
              <span className="btn-text">LOGIN</span>
            </Link>
          )}
          {!isRegisterPage && (
            <Link to="/register" className="btn-link btn-register">
              <i className="fa-solid fa-user-plus"></i>
              <span className="btn-text">REGISTER</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

