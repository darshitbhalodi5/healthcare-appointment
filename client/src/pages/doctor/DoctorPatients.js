import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Input, Empty } from "antd";
import "../../styles/AppointmentCards.css";
import "../../styles/DoctorPatients.css";

const { Search } = Input;

const DoctorPatients = () => {
  const [groupedAppointments, setGroupedAppointments] = useState([]);
  const [filteredGroupedAppointments, setFilteredGroupedAppointments] = useState(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const getGroupedAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/doctor/doctor-grouped-appointments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        const data = res.data.data || [];
        setGroupedAppointments(data);
        setFilteredGroupedAppointments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroupedAppointments();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredGroupedAppointments(groupedAppointments);
      return;
    }

    const filtered = groupedAppointments.filter((group) => {
      const fullName = `${group.patient?.firstName || ""} ${
        group.patient?.lastName || ""
      }`
        .trim()
        .toLowerCase();
      return fullName.includes(term);
    });

    setFilteredGroupedAppointments(filtered);
  }, [searchTerm, groupedAppointments]);

  const handlePatientClick = (group) => {
    if (!group || !group.patient) return;

    const params = new URLSearchParams();
    params.set("view", "grouped");

    const patient = group.patient;
    const patientId = patient._id || patient.userId || patient.id;
    if (patientId) {
      params.set("patientId", patientId);
    }

    window.location.href = `/doctor-appointments?${params.toString()}`;
  };

  return (
    <Layout>
      <div className="appointments-container">
        <div className="appointments-header">
          <h1>Patients</h1>
          <p className="appointments-subtitle">
            Search a patient by name to view all their appointment history.
          </p>
        </div>

        <div className="admin-controls stacked" style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search patient by name"
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            loading={loading}
          />
        </div>

        <div className="patients-list-container">
          {filteredGroupedAppointments && filteredGroupedAppointments.length > 0 ? (
            <div className="patients-list">
              {filteredGroupedAppointments.map((group) => {
                const patient = group.patient || {};
                const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "Unknown patient";
                const stats = group.statistics || {};

                return (
                  <div
                    key={patient._id || patient.userId || fullName}
                    className="patient-row-card"
                    onClick={() => handlePatientClick(group)}
                  >
                    <div className="patient-row-left">
                      <div className="patient-avatar-circle">
                        <i className="fa-regular fa-user" />
                      </div>
                      <div className="patient-main-info">
                        <div className="patient-name">{fullName}</div>
                        <div className="patient-sub-info">
                          {stats.totalAppointments
                            ? `${stats.totalAppointments} visit${stats.totalAppointments > 1 ? "s" : ""}`
                            : "No visit stats"}
                        </div>
                      </div>
                    </div>
                    <div className="patient-row-right">
                      <span className="patient-chevron">
                        <i className="fa-solid fa-chevron-right" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty
              description="No patients found for this doctor"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorPatients;


