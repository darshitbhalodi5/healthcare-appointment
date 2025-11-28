import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Navbar.css";
import "../styles/Footer.css";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Skip the queues, Get the care you need.</h1>
          <div className="hero-text">
            <p className="hero-subtitle">Not feeling well today? Let us help.</p>
          </div>
          <Link to="/login" className="btn-appointment">
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
