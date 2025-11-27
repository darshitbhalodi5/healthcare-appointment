import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import "../styles/BookingPage.css";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState();
  const [isAvailable, setIsAvailable] = useState(false);
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
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
    }
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
                  <span>Available Timings:</span>{" "}
                  {doctors.timings && doctors.timings[0]} -{" "}
                  {doctors.timings && doctors.timings[1]}
                </h4>
              </div>
              <div className="booking-form-wrapper">
                <DatePicker
                  aria-required={"true"}
                  format="DD-MM-YYYY"
                  placeholder="Select Date"
                  onChange={(value) => {
                    setDate(moment(value).format("DD-MM-YYYY"));
                  }}
                />
                <TimePicker
                  aria-required={"true"}
                  format="HH:mm"
                  placeholder="Select Time"
                  onChange={(value) => {
                    setTime(moment(value).format("HH:mm"));
                  }}
                />

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
    </Layout>
  );
};

export default BookingPage;