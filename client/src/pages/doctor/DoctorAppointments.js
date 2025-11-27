import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import { message, Table } from "antd";
import "../../styles/Tables.css";
import "../../styles/AppointmentCards.css";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/doctor//doctor-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleResize = () =>
      setIsMobileView(typeof window !== "undefined" ? window.innerWidth < 768 : false);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "/api/v1/doctor/update-status",
        { appointmentsId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      render: (text) => <span className="appointment-id">{text.slice(-8)}</span>,
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <span className={`status-badge ${status}`}>{status}</span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" ? (
            <div className="d-flex">
              <button
                className="btn btn-success"
                onClick={() => handleStatus(record, "approved")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger ms-2"
                onClick={() => handleStatus(record, "reject")}
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="no-action">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h1>Appointments List</h1>
        </div>

        {isMobileView ? (
          <div className="appointments-card-grid">
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div className="appointment-card" key={appointment._id}>
                  <div className="appointment-card-header">
                    <span className="appointment-id">
                      #{appointment._id.slice(-8)}
                    </span>
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-card-body">
                    <div className="appointment-info-row">
                      <span className="info-label">Date</span>
                      <span className="info-value">
                        {moment(appointment.date).format("DD-MM-YYYY")}
                      </span>
                    </div>
                    <div className="appointment-info-row">
                      <span className="info-label">Time</span>
                      <span className="info-value">
                        {moment(appointment.time).format("HH:mm")}
                      </span>
                    </div>
                  </div>
                  {appointment.status === "pending" && (
                    <div className="appointment-card-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => handleStatus(appointment, "approved")}
                      >
                        <i className="fa-solid fa-check"></i> Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleStatus(appointment, "reject")}
                      >
                        <i className="fa-solid fa-times"></i> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Appointments</h3>
                <p>You don't have any appointments yet.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Table columns={columns} dataSource={appointments} rowKey="_id" />
            <div className="table-scroll-hint">
              Scroll horizontally to view all columns
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DoctorAppointments;