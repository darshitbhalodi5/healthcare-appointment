import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import { message, Table, Modal, Divider, Input, Spin, Switch } from "antd";
import { EyeOutlined, FileTextOutlined, UnorderedListOutlined, GroupOutlined } from "@ant-design/icons";
import FileUpload from "../../components/FileUpload";
import DocumentList from "../../components/DocumentList";
import GroupedAppointments from "../../components/GroupedAppointments";
import "../../styles/Tables.css";
import "../../styles/AppointmentCards.css";

const { TextArea } = Input;

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [appointmentDocuments, setAppointmentDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const getAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/doctor/doctor-appointments", {
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

  const getGroupedAppointments = async () => {
    try {
      const res = await axios.get("/api/v1/doctor/doctor-grouped-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setGroupedAppointments(res.data.data);
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
    getGroupedAppointments();
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

  // Handle save general notes
  const handleSaveNotes = async () => {
    if (!selectedAppointment) return;

    setSavingNotes(true);
    try {
      const res = await axios.put(
        `/api/v1/appointment/${selectedAppointment._id}/notes`,
        { notes: generalNotes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        message.success('Notes saved successfully');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
    setAppointmentDocuments([]);
    setGeneralNotes('');
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
        <div className="d-flex gap-2">
          {record.status === "pending" ? (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleStatus(record, "approved")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleStatus(record, "reject")}
              >
                Reject
              </button>
            </>
          ) : (
            <EyeOutlined
              onClick={() => handleViewDetails(record)}
              style={{ fontSize: '18px', color: '#1890ff', cursor: 'pointer' }}
              title="View Details & Documents"
            />
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
          <div className="view-toggle">
            <UnorderedListOutlined />
            <Switch
              checked={viewMode === 'grouped'}
              onChange={(checked) => setViewMode(checked ? 'grouped' : 'list')}
            />
            <GroupOutlined />
          </div>
        </div>

        {viewMode === 'grouped' ? (
          <GroupedAppointments
            groupedData={groupedAppointments}
            userRole="doctor"
            onViewDetails={handleViewDetails}
          />
        ) : isMobileView ? (
          <div className="appointments-card-grid">
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  className="appointment-card"
                  key={appointment._id}
                  onClick={() => appointment.status !== "pending" && handleViewDetails(appointment)}
                  style={{ cursor: appointment.status !== "pending" ? 'pointer' : 'default' }}
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
                      <span className="info-label">Patient</span>
                      <span className="info-value">
                        {appointment.patientName || 'Not assigned'}
                      </span>
                    </div>
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
                  {appointment.status === "pending" ? (
                    <div className="appointment-card-actions">
                      <button
                        className="btn btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatus(appointment, "approved");
                        }}
                      >
                        <i className="fa-solid fa-check"></i> Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatus(appointment, "reject");
                        }}
                      >
                        <i className="fa-solid fa-times"></i> Reject
                      </button>
                    </div>
                  ) : (
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
            <Divider className="modal-divider-mobile">General Notes</Divider>

            {/* General Notes */}
            {selectedAppointment.status === 'approved' && (
              <div className="general-notes-section-mobile">
                <TextArea
                  rows={4}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Add general notes for this appointment (diagnosis, treatment plan, follow-up instructions, etc.)"
                  className="notes-textarea-mobile"
                />
                <button
                  className="btn btn-primary save-notes-btn-mobile"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            )}

            <Divider className="modal-divider-mobile">Upload Prescription</Divider>

            {/* File Upload (Doctor) */}
            {selectedAppointment.status === 'approved' && (
              <FileUpload
                appointmentId={selectedAppointment._id}
                onUploadSuccess={handleUploadSuccess}
                label="Upload Prescription or Reports"
                maxFiles={10}
              />
            )}

            <Divider className="modal-divider-mobile">Patient Documents</Divider>

            {/* Document List with commenting ability */}
            {loadingDocuments ? (
              <div className="loading-section-mobile">
                <Spin size="large" />
              </div>
            ) : (
              <DocumentList
                appointmentId={selectedAppointment._id}
                documents={appointmentDocuments}
                userRole="doctor"
                onRefresh={() => fetchAppointmentDocuments(selectedAppointment._id)}
              />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default DoctorAppointments;