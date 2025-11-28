import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker, Modal } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import FileUpload from "../components/FileUpload";
import "../styles/BookingPage.css";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState();
  const [isAvailable, setIsAvailable] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);
  const dispatch = useDispatch();
  // login user data
  const getUserData = async () => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // ============ handle availiblity
  const handleAvailability = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        setIsAvailable(true);
        console.log(isAvailable);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };
  // =============== booking func
  const handleBooking = async () => {
    try {
      setIsAvailable(true);
      if (!date && !time) {
        return alert("Date & Time Required");
      }
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);

        // Store appointment ID and show upload modal
        if (res.data.data && res.data.data._id) {
          setCreatedAppointmentId(res.data.data._id);
          setShowUploadModal(true);
        }
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
  };

  // Handle file upload success
  const handleUploadSuccess = () => {
    message.success('Document uploaded successfully');
  };

  // Handle skip upload and go to appointments
  const handleSkipUpload = () => {
    setShowUploadModal(false);
    navigate('/appointments');
  };

  // Handle done with upload
  const handleDoneWithUpload = () => {
    setShowUploadModal(false);
    navigate('/appointments');
  };

  useEffect(() => {
    getUserData();
    //eslint-disable-next-line
  }, []);
  return (
    <Layout>
      <div className="booking-container">
        <div className="booking-info">
          <h3>Book Appointment</h3>
          {doctors && (
            <div>
              <div className="doctor-details">
                <h4>
                  <span>Doctor:</span> Dr. {doctors.firstName} {doctors.lastName}
                </h4>
                <h4>
                  <span>Fees:</span> ${doctors.feesPerCunsaltation}
                </h4>
                <h4>
                  <span>Available Timings (UTC):</span>{" "}
                  {doctors.timings && doctors.timings[0]} -{" "}
                  {doctors.timings && doctors.timings[1]}
                </h4>
              </div>
              <div className="booking-form-wrapper">
                <div className="form-field">
                  <label className="field-label">Select Date</label>
                  <DatePicker
                    aria-required={"true"}
                    format="DD-MM-YYYY"
                    placeholder="DD-MM-YYYY"
                    className="date-picker"
                    onChange={(value) => {
                      if (value) {
                        setDate(value.format("DD-MM-YYYY"));
                      }
                    }}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label">Select Time (UTC)</label>
                  <TimePicker
                    aria-required={"true"}
                    format="HH:mm"
                    placeholder="HH:mm (UTC)"
                    className="time-picker"
                    onChange={(value) => {
                      if (value) {
                        setTime(value.format("HH:mm"));
                      }
                    }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleAvailability}
                >
                  Check Availability
                </button>

                <button className="btn btn-dark" onClick={handleBooking}>
                  Book Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Modal */}
      <Modal
        title="Upload Medical Documents (Optional)"
        open={showUploadModal}
        onCancel={handleSkipUpload}
        footer={null}
        width="90%"
        style={{ maxWidth: 700, top: 20 }}
        className="upload-modal-mobile"
      >
        <p className="modal-description-mobile">
          You can upload relevant medical documents such as previous prescriptions,
          lab reports, or medical history to help your doctor prepare for the appointment.
        </p>

        <FileUpload
          appointmentId={createdAppointmentId}
          onUploadSuccess={handleUploadSuccess}
          label="Upload Documents"
          maxFiles={5}
        />

        <div className="modal-note-mobile">
          <small>
            <strong>Note:</strong> You can also upload documents later from your Appointments page.
          </small>
        </div>

        <div className="modal-footer-actions-mobile">
          <button className="btn btn-secondary" onClick={handleSkipUpload}>
            Skip for Now
          </button>
          <button className="btn btn-primary" onClick={handleDoneWithUpload}>
            Done
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default BookingPage;