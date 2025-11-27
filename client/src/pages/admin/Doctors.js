import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Input, message, Table } from "antd";
import "../../styles/Tables.css";
import "../../styles/AdminDoctors.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [searchTerm, setSearchTerm] = useState("");
  //getUsers
  const getDoctors = async () => {
    try {
      const res = await axios.get("/api/v1/admin/getAllDoctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle account
  const handleAccountStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "/api/v1/admin/changeAccountStatus",
        { doctorId: record._id, userId: record.userId, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        window.location.reload();
      }
    } catch (error) {
      message.error("Something Went Wrong");
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
    getDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const name = `${doctor.firstName || ""} ${doctor.lastName || ""}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span>
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "phone",
      dataIndex: "phone",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <>
              <button
                className="btn btn-success"
                onClick={() => handleAccountStatus(record, "approved")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger ms-2"
                onClick={() => handleAccountStatus(record, "rejected")}
              >
                Reject
              </button>
            </>
          )}
          {record.status === "approved" && (
            <button
              className="btn btn-warning"
              onClick={() => handleAccountStatus(record, "blocked")}
            >
              Block
            </button>
          )}
          {record.status !== "pending" && record.status !== "approved" && (
            <span className="status-pill table">
              {record.status === "blocked" ? "Blocked" : record.status}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="table-container">
        <div className="table-header gradient">
          <h1>All Doctors</h1>
        </div>
        <div className="admin-controls">
          <Input
            placeholder="Search doctor by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
        {isMobileView ? (
          <div className="doctor-card-grid">
            {filteredDoctors && filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div className="doctor-card admin" key={doctor._id}>
                  <div className="doctor-card-header">
                    <h3>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <span className={`status-badge ${doctor.status}`}>
                      {doctor.status}
                    </span>
                  </div>
                  <div className="doctor-card-body">
                    <p>
                      <strong>Phone:</strong> {doctor.phone || "N/A"}
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {doctor.specialization || "N/A"}
                    </p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {doctor.experience ? `${doctor.experience} yrs` : "N/A"}
                    </p>
                    <p>
                      <strong>Fees:</strong>{" "}
                      {doctor.feesPerCunsaltation
                        ? `$${doctor.feesPerCunsaltation}`
                        : "N/A"}
                    </p>
                  </div>
                  <div className="doctor-card-actions">
                    {doctor.status === "pending" && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            handleAccountStatus(doctor, "approved")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            handleAccountStatus(doctor, "rejected")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {doctor.status === "approved" && (
                      <button
                        className="btn btn-warning"
                        onClick={() =>
                          handleAccountStatus(doctor, "blocked")
                        }
                      >
                        Block
                      </button>
                    )}
                    {doctor.status !== "pending" &&
                      doctor.status !== "approved" && (
                        <span className="status-pill">
                          {doctor.status === "blocked"
                            ? "Blocked"
                            : doctor.status}
                        </span>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Doctor Applications</h3>
                <p>New applications will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Table columns={columns} dataSource={filteredDoctors} rowKey="_id" />
            <div className="table-scroll-hint">
              Scroll horizontally to view all columns
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Doctors;