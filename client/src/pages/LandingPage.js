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

          <div className="doctor-profile-card">
            <h2 className="doctor-name">Dr. Maitrey Patel</h2>
            <p className="doctor-qualification">MD DrNB Gastroenterology</p>
            <p className="doctor-role">
              Consultant Gastroenterologist, Endoscopist and Hepatologist
            </p>
            <div className="doctor-contact">
              <a href="tel:7760378269" className="doctor-contact-item">
                +91 77603 78269
              </a>
              <a href="mailto:ptlmaitrey@gmail.com" className="doctor-contact-item">
                ptlmaitrey@gmail.com
              </a>
            </div>
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
