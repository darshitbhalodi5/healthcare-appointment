import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Input, TimePicker, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import moment from "moment";
import "../../styles/UserProfile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [editableFields, setEditableFields] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  // Fields that require admin approval
  const adminApprovalFields = ["specialization", "experience", "feesPerCunsaltation"];
  // Toggle field edit mode
  const toggleFieldEdit = (fieldName) => {
    setEditableFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Handle field value change
  const handleFieldChange = (fieldName, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Check if any field has been edited
  const hasChanges = () => {
    return Object.keys(editedValues).length > 0;
  };

  // Handle update
  const handleUpdate = async () => {
    if (!hasChanges()) {
      message.info("No changes to update");
      return;
    }

    try {
      dispatch(showLoading());

      // Separate fields into direct update and admin approval
      const directUpdateFields = {};
      const adminApprovalFieldsData = {};

      Object.keys(editedValues).forEach((field) => {
        if (adminApprovalFields.includes(field)) {
          adminApprovalFieldsData[field] = editedValues[field];
        } else {
          directUpdateFields[field] = editedValues[field];
        }
      });

      // Format timings if present - TimePicker.RangePicker returns moment objects
      if (directUpdateFields.timings && directUpdateFields.timings.length === 2) {
        directUpdateFields.timings = [
          directUpdateFields.timings[0].format("HH:mm"),
          directUpdateFields.timings[1].format("HH:mm"),
        ];
      }

      const payload = {
        userId: user._id,
        directUpdate: directUpdateFields,
        adminApproval: adminApprovalFieldsData,
      };

      const res = await axios.post("/api/v1/doctor/updateProfile", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message);
        setEditedValues({});
        setEditableFields({});
        getDoctorInfo(); // Refresh doctor data
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something went wrong");
    }
  };

  //getDOc Details
  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorInfo",
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorInfo();
    //eslint-disable-next-line
  }, []);

  // Get current value (edited or original)
  const getCurrentValue = (field) => {
    return editedValues[field] !== undefined ? editedValues[field] : doctor[field];
  };

  // Render field based on type
  const renderField = (field, type, label) => {
    const isEditing = editableFields[field];
    const currentValue = getCurrentValue(field);
    const requiresApproval = adminApprovalFields.includes(field);

    return (
      <div className="profile-field" key={field}>
        <div className="field-header">
          <label className="field-label">
            {label}
            {requiresApproval && <span className="approval-badge">Requires Admin Approval</span>}
          </label>
          <button
            type="button"
            className="edit-icon-btn"
            onClick={() => toggleFieldEdit(field)}
            title={isEditing ? "Cancel" : "Edit"}
          >
            <i className={`fa-solid ${isEditing ? "fa-times" : "fa-pen"}`}></i>
          </button>
        </div>
        <div className="field-content">
          {isEditing ? (
            type === "time-range" ? (
              <TimePicker.RangePicker
                format="HH:mm"
                value={
                  currentValue && currentValue.length === 2
                    ? [moment(currentValue[0], "HH:mm"), moment(currentValue[1], "HH:mm")]
                    : doctor.timings
                    ? [moment(doctor.timings[0], "HH:mm"), moment(doctor.timings[1], "HH:mm")]
                    : null
                }
                onChange={(val) => handleFieldChange(field, val)}
                className="field-input-time"
              />
            ) : (
              <Input
                type={type}
                value={currentValue}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="field-input"
              />
            )
          ) : (
            <span className="field-value">
              {type === "time-range"
                ? currentValue && currentValue.length === 2
                  ? `${currentValue[0]} - ${currentValue[1]}`
                  : "N/A"
                : currentValue || "N/A"}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (!doctor) {
    return (
      <Layout>
        <div className="profile-page">
          <div className="loading-state">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <h2>Doctor Profile</h2>
          <span className={`status-badge status-${doctor.status}`}>
            {doctor.status}
          </span>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Personal Details</h3>
          <div className="profile-fields-grid">
            {renderField("firstName", "text", "First Name")}
            {renderField("lastName", "text", "Last Name")}
            {renderField("email", "email", "Email")}
            {renderField("phone", "text", "Phone")}
            {renderField("address", "text", "Clinic Address")}
            {renderField("website", "text", "Website")}
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Professional Details</h3>
          <div className="profile-fields-grid">
            {renderField("specialization", "text", "Specialization")}
            {renderField("experience", "text", "Experience")}
            {renderField("feesPerCunsaltation", "number", "Fees Per Consultation")}
            {renderField("timings", "time-range", "Available Timings (UTC)")}
          </div>
        </div>

        {hasChanges() && (
          <div className="update-section">
            <button
              className="btn-update"
              onClick={handleUpdate}
              disabled={!hasChanges()}
            >
              <i className="fa-solid fa-check"></i> Update Profile
            </button>
            <p className="update-info">
              {Object.keys(editedValues).some((field) =>
                adminApprovalFields.includes(field)
              ) && (
                <span className="info-text">
                  <i className="fa-solid fa-info-circle"></i> Some changes require
                  admin approval
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;