import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Input, message, Table, Modal, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import "../../styles/Tables.css";
import "../../styles/AdminDoctors.css";

const adminApprovalFields = ["specialization", "experience", "feesPerCunsaltation"];
const fieldLabels = {
  specialization: "Specialization",
  experience: "Experience",
  feesPerCunsaltation: "Fees Per Consultation",
};

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

  // handle account status (initial approval only)
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
        getDoctors(); // Refresh list instead of reload
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Something Went Wrong");
    }
  };

  // handle profile update approval/rejection
  const handleUpdateApproval = async (record, action) => {
    try {
      const res = await axios.post(
        "/api/v1/admin/approveProfileUpdate",
        { doctorId: record._id, action: action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getDoctors(); // Refresh list
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Something Went Wrong");
    }
  };

  const renderPendingUpdates = (record) => {
    if (!record.pendingUpdates) return null;

    const relevantUpdates = Object.entries(record.pendingUpdates).filter(([key]) =>
      adminApprovalFields.includes(key)
    );

    if (relevantUpdates.length === 0) return null;

    return (
      <div className="pending-updates-card">
        <h4>Update</h4>
        <div className="pending-updates-list">
          {relevantUpdates.map(([key, newValue]) => (
            <div className="pending-update-row" key={key}>
              <span className="pending-label">{fieldLabels[key] || key}</span>
              <div className="pending-values">
                <span className="pending-old">{record[key] || "N/A"}</span>
                <span className="pending-arrow">→</span>
                <span className="pending-new">{newValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // handle doctor deletion
  const handleDeleteDoctor = async (record) => {
    Modal.confirm({
      title: "Delete Doctor?",
      content: `Are you sure you want to permanently delete Dr. ${record.firstName} ${record.lastName}?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          const res = await axios.delete(
            "/api/v1/admin/deleteDoctor",
            {
              data: { doctorId: record._id, userId: record.userId },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.data.success) {
            message.success("Doctor deleted successfully");
            getDoctors(); // Refresh list
          }
        } catch (error) {
          message.error(error.response?.data?.message || "Failed to delete doctor");
        }
      },
    });
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
        <div className="d-flex flex-wrap gap-2">
          {/* Initial Account Approval (only for pending accounts without pending updates) */}
          {record.status === "pending" && !record.hasPendingUpdates && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleAccountStatus(record, "approved")}
              >
                Add
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleAccountStatus(record, "rejected")}
              >
                Reject
              </button>
            </>
          )}

          {/* Profile Update Approval (for approved doctors with pending updates) */}
          {record.status === "approved" && record.hasPendingUpdates && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleUpdateApproval(record, "approve")}
                title="Approve updates"
              >
                Update
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleUpdateApproval(record, "reject")}
                title="Reject updates"
              >
                Reject
              </button>
            </>
          )}

          {record.hasPendingUpdates && renderPendingUpdates(record)}

          {/* Status indicators for approved/rejected doctors */}
          {record.status === "approved" && !record.hasPendingUpdates && (
            <Tag color="green">Active</Tag>
          )}
          {record.status === "rejected" && (
            <Tag color="red">Rejected</Tag>
          )}

          {/* Delete Doctor (always available) */}
          <DeleteOutlined
            onClick={() => handleDeleteDoctor(record)}
            style={{ fontSize: '18px', color: '#ff4d4f', cursor: 'pointer', marginLeft: '8px' }}
            title="Delete doctor"
          />

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
                    {/* Initial Account Approval */}
                    {doctor.status === "pending" && !doctor.hasPendingUpdates && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleAccountStatus(doctor, "approved")}
                        >
                          Add
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleAccountStatus(doctor, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {doctor.hasPendingUpdates && renderPendingUpdates(doctor)}

                    {/* Profile Update Approval */}
                    {doctor.status === "approved" && doctor.hasPendingUpdates && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleUpdateApproval(doctor, "approve")}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleUpdateApproval(doctor, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    

                    {/* Status indicators */}
                    {doctor.status === "approved" && !doctor.hasPendingUpdates && (
                      <Tag color="green">Active</Tag>
                    )}
                    {doctor.status === "rejected" && (
                      <Tag color="red">Rejected</Tag>
                    )}

                    {/* Delete Doctor */}
                    <DeleteOutlined
                      onClick={() => handleDeleteDoctor(doctor)}
                      style={{ fontSize: '18px', color: '#ff4d4f', cursor: 'pointer' }}
                      title="Delete Doctor"
                    />
                  </div>

                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Doctors</h3>
                <p>New doctors will appear here.</p>
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