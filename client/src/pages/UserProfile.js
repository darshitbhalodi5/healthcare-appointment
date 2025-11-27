import React from "react";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";
import "../styles/UserProfileView.css";

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    return (
      <Layout>
        <div className="user-profile-page">
          <div className="loading-state">
            <h3>Loading Profile...</h3>
            <p>Please wait while we load your information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const personalInfo = [
    { label: "First Name", value: user.firstName, icon: "fa-user" },
    { label: "Last Name", value: user.lastName, icon: "fa-user" },
    { label: "Email", value: user.email, icon: "fa-envelope" },
    { label: "Mobile Number", value: user.mobileNumber, icon: "fa-phone" },
    { label: "Address", value: user.address, icon: "fa-location-dot" },
    {
      label: "Date of Birth",
      value: user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      icon: "fa-calendar",
    },
  ];

  const accountInfo = [
    {
      label: "Email Verified",
      value: user.emailVerified ? "Yes" : "No",
      icon: "fa-circle-check",
      status: user.emailVerified ? "verified" : "unverified",
    },
    {
      label: "Doctor Account",
      value: user.isDoctor ? "Active" : "Not a Doctor",
      icon: "fa-user-doctor",
      status: user.isDoctor ? "doctor" : "user",
    },
    {
      label: "Member Since",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      icon: "fa-calendar-plus",
    },
  ];

  return (
    <Layout>
      <div className="user-profile-page">
        {/* Profile Header */}
        <div className="user-profile-header">
          <div className="header-content">
            <div className="user-avatar">
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="header-info">
              <h1>
                {user.firstName} {user.lastName}
              </h1>
              <p className="user-role">
                {user.isDoctor ? "Doctor" : user.isAdmin ? "Admin" : "Patient"}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>
              <i className="fa-solid fa-id-card"></i>
              Personal Information
            </h2>
          </div>
          <div className="info-grid">
            {personalInfo.map(({ label, value, icon }) => (
              <div className="info-card" key={label}>
                <div className="info-icon">
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="info-content">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>
              <i className="fa-solid fa-shield-halved"></i>
              Account Information
            </h2>
          </div>
          <div className="info-grid">
            {accountInfo.map(({ label, value, icon, status }) => (
              <div className="info-card" key={label}>
                <div className={`info-icon ${status || ""}`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="info-content">
                  <span className="info-label">{label}</span>
                  <span className={`info-value ${status || ""}`}>
                    {value || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;

