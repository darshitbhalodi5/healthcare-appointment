import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserTimezone, utcTimeToLocalTime } from "../utils/timezoneUtils";
import "../styles/DoctorList.css";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();
  const userTimezone = getUserTimezone();

  // Convert doctor timings from UTC to patient's timezone for display
  const getDisplayTimings = () => {
    if (!doctor || !doctor.timings) {
      return "N/A";
    }
    
    let utcStartTime, utcEndTime;
    
    if (Array.isArray(doctor.timings)) {
      utcStartTime = doctor.timings[0];
      utcEndTime = doctor.timings[1];
    } else if (typeof doctor.timings === "object") {
      utcStartTime = doctor.timings[0] || doctor.timings.start;
      utcEndTime = doctor.timings[1] || doctor.timings.end;
    } else {
      return "N/A";
    }
    
    if (!utcStartTime || !utcEndTime) {
      return "N/A";
    }
    
    // Convert UTC times to patient's timezone
    const localStartTime = utcTimeToLocalTime(utcStartTime, userTimezone);
    const localEndTime = utcTimeToLocalTime(utcEndTime, userTimezone);
    
    return `${localStartTime} - ${localEndTime}`;
  };

  const timingsDisplay = getDisplayTimings();

  return (
    <>
      <div
        className="doctor-card"
        onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
      >
        <div className="card-header">
          Dr. {doctor.firstName} {doctor.lastName}
        </div>
        <div className="card-body">
          <div className="info-item">
            <span className="info-label">Specialization</span>
            <span className="info-value">{doctor.specialization || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Experience</span>
            <span className="info-value">{doctor.experience}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fees</span>
            <span className="info-value">${doctor.feesPerCunsaltation}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Timings</span>
            <span className="info-value">{timingsDisplay}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorList;
