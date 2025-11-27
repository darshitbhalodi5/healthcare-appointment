import React from "react";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    return (
      <Layout>
        <div className="profile-page">
          <div className="profile-card empty">
            <p>User information is not available yet.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const infoRows = [
    { label: "First Name", value: user.firstName },
    { label: "Last Name", value: user.lastName },
    { label: "Email", value: user.email },
    { label: "Mobile Number", value: user.mobileNumber },
    { label: "Address", value: user.address },
    {
      label: "Date of Birth",
      value: user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString()
        : "N/A",
    },
    { label: "Email Verified", value: user.emailVerified ? "Yes" : "No" },
    { label: "Doctor Account", value: user.isDoctor ? "Yes" : "No" },
    {
      label: "Member Since",
      value: user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
    },
  ];

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-grid">
          {infoRows.map(({ label, value }) => (
            <div className="profile-tile" key={label}>
              <span className="profile-label">{label}</span>
              <span className="profile-value">
                {value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;

