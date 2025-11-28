import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { Table, Modal, Divider, message, Spin } from "antd";
import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import FileUpload from "../components/FileUpload";
import DocumentList from "../components/DocumentList";
import "../styles/Tables.css";
import "../styles/AppointmentCards.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [appointmentDocuments, setAppointmentDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/user/user-appointments", {
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

  // Fetch documents for selected appointment
  const fetchAppointmentDocuments = async (appointmentId) => {
    setLoadingDocuments(true);
    try {
      const res = await axios.get(
        `/api/v1/appointment/${appointmentId}/documents`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setAppointmentDocuments(res.data.appointment.documents || []);
        setGeneralNotes(res.data.appointment.generalNotes || '');
      }
    } catch (error) {
      message.error('Failed to load documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
    await fetchAppointmentDocuments(appointment._id);
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    if (selectedAppointment) {
      fetchAppointmentDocuments(selectedAppointment._id);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
    setAppointmentDocuments([]);
    setGeneralNotes('');
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
        <EyeOutlined
          onClick={() => handleViewDetails(record)}
          style={{ fontSize: '18px', color: '#1890ff', cursor: 'pointer' }}
          title="View Details & Documents"
        />
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h1>My Appointments</h1>
        </div>

        {isMobileView ? (
          <div className="appointments-card-grid">
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  className="appointment-card"
                  key={appointment._id}
                  onClick={() => handleViewDetails(appointment)}
                  style={{ cursor: 'pointer' }}
                >
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
                <div className="view-documents-wrapper">
                  <button
                    type="button"
                    className="view-documents-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(appointment);
                    }}
                  >
                    <EyeOutlined />
                    <span>View documents</span>
                  </button>
                </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Appointments</h3>
                <p>You haven't booked any appointments yet.</p>
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

      {/* Appointment Details Modal */}
      <Modal
        title={
          <span>
            <FileTextOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '8px' }}/> Appointment Documents
          </span>
        }
        open={showDetailsModal}
        onCancel={handleCloseModal}
        footer={null}
        width="95%"
        style={{ maxWidth: 900, top: 20 }}
        className="appointment-details-modal-mobile"
      >
        {selectedAppointment && (
          <div>
            {/* Doctor's General Notes - Only show if notes exist */}
            {generalNotes && generalNotes.trim() && (
              <>
                <Divider className="modal-divider-mobile">Doctor's Instructions</Divider>
                <div className="patient-notes-view-compact">
                  <p>{generalNotes}</p>
                </div>
              </>
            )}

            <Divider className="modal-divider-mobile">Upload Documents</Divider>

            {/* File Upload */}
            {selectedAppointment.status !== 'reject' && (
              <FileUpload
                appointmentId={selectedAppointment._id}
                onUploadSuccess={handleUploadSuccess}
                label="Add More Documents"
                maxFiles={10}
              />
            )}

            <Divider className="modal-divider-mobile">My Documents</Divider>

            {/* Document List */}
            {loadingDocuments ? (
              <div className="loading-section-mobile">
                <Spin size="large" />
              </div>
            ) : (
              <DocumentList
                appointmentId={selectedAppointment._id}
                documents={appointmentDocuments}
                userRole="patient"
                onRefresh={() => fetchAppointmentDocuments(selectedAppointment._id)}
              />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Appointments;