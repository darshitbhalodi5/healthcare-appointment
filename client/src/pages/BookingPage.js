import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { message, Modal, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import FileUpload from "../components/FileUpload";
import AppointmentCalendar from "../components/AppointmentCalendar";
import TimeSlotPicker from "../components/TimeSlotPicker";
import { getUserTimezone, localToUTC } from "../utils/timezoneUtils";
import "../styles/BookingPage.css";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState(null);

  const userTimezone = getUserTimezone();

  // Fetch doctor data
  const getDoctorData = async () => {
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
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error("Error loading doctor details");
    }
  };

  // Fetch booked slots for selected date
  const fetchBookedSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const res = await axios.post(
        "/api/v1/user/get-booked-slots",
        { doctorId: params.doctorId, date },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setBookedSlots(res.data.bookedSlots);
      }
    } catch (error) {
      console.log(error);
      message.error("Error loading available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    setShowTimeSlots(true);
    fetchBookedSlots(date);
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Handle back from time slots
  const handleBackToCalendar = () => {
    setShowTimeSlots(false);
    setSelectedTime("");
  };

  // Book appointment
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      return message.error("Please select both date and time");
    }

    try {
      dispatch(showLoading());

      // Convert local datetime to UTC
      const dateTimeUTC = localToUTC(selectedDate, selectedTime, userTimezone);

      const res = await axios.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: selectedDate,
          time: selectedTime,
          dateTimeUTC: dateTimeUTC.toISOString(),
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
      message.error(error.response?.data?.message || "Error booking appointment");
    }
  };

  // Handle file upload success
  const handleUploadSuccess = () => {
    message.success("Document uploaded successfully");
  };

  // Handle skip upload and go to appointments
  const handleSkipUpload = () => {
    setShowUploadModal(false);
    navigate("/appointments");
  };

  // Handle done with upload
  const handleDoneWithUpload = () => {
    setShowUploadModal(false);
    navigate("/appointments");
  };

  useEffect(() => {
    getDoctorData();
    //eslint-disable-next-line
  }, []);

  if (!doctor) {
    return (
      <Layout>
        <div className="booking-container">
          <div className="loading-section">
            <Spin size="large" />
            <p>Loading doctor details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="booking-container">
        <div className="booking-header">
          <h2>Book Appointment</h2>
          <div className="doctor-card">
            <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
            <p className="specialization">{doctor.specialization}</p>
            <div className="doctor-info-row">
              <span className="label">Fees:</span>
              <span className="value">${doctor.feesPerCunsaltation}</span>
            </div>
            <div className="doctor-info-row">
              <span className="label">Available Timings:</span>
              <span className="value">
                {doctor.timings && doctor.timings[0]} - {doctor.timings && doctor.timings[1]}
              </span>
            </div>
          </div>
        </div>

        <div className="booking-content">
          {!showTimeSlots ? (
            <AppointmentCalendar
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          ) : (
            <>
              <TimeSlotPicker
                selectedDate={selectedDate}
                doctorTimings={doctor.timings}
                bookedSlots={bookedSlots}
                onTimeSelect={handleTimeSelect}
                selectedTime={selectedTime}
                onBack={handleBackToCalendar}
                loading={loadingSlots}
              />

              {selectedTime && (
                <div className="booking-actions">
                  <button
                    className="btn btn-primary btn-book-now"
                    onClick={handleBooking}
                  >
                    Book Now
                  </button>
                </div>
              )}
            </>
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
