import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import DoctorList from "../components/DoctorList";
import "../styles/HomePage.css";
const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  // login user data
  const getUserData = async () => {
    try {
      const res = await axios.get(
        "/api/v1/user/getAllDoctors",

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

  useEffect(() => {
    getUserData();
  }, []);
  return (
    <Layout>
      <div className="home-page-header">
        <h1>Find & Book Appointments</h1>
      </div>
      <div className="doctor-grid">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => <DoctorList key={doctor._id} doctor={doctor} />)
        ) : (
          <div className="empty-state">
            <h3>No Doctors Available</h3>
            <p>Please check back later for available doctors.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;