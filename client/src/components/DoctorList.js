import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DoctorList.css";

const DoctorList = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle timings - check if it's an array or object
  let timingsDisplay = "N/A";
  if (doctor.timings) {
    if (Array.isArray(doctor.timings)) {
      timingsDisplay = `${doctor.timings[0] || "N/A"} - ${doctor.timings[1] || "N/A"}`;
    } else if (typeof doctor.timings === "object") {
      timingsDisplay = `${doctor.timings[0] || doctor.timings.start || "N/A"} - ${doctor.timings[1] || doctor.timings.end || "N/A"}`;
    }
  }

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
