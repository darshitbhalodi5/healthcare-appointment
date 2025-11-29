import React, { useState } from 'react';
import { Collapse, Card, Tag, Button, Empty } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import AISummaryPlaceholder from './AISummaryPlaceholder';
import { formatAppointmentTime } from '../utils/timezoneUtils';
import './GroupedAppointments.css';

const { Panel } = Collapse;

const GroupedAppointments = ({ groupedData, userRole, onViewDetails }) => {
  const [activeKeys, setActiveKeys] = useState([]);

  if (!groupedData || groupedData.length === 0) {
    return (
      <Empty
        description="No grouped appointments found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Get person info based on role
  const getPersonInfo = (group) => {
    if (userRole === 'doctor') {
      return {
        name: `${group.patient.firstName} ${group.patient.lastName}`,
        email: group.patient.email,
        icon: <UserOutlined />,
        label: 'Patient',
      };
    } else {
      return {
        name: `Dr. ${group.doctor.firstName} ${group.doctor.lastName}`,
        email: group.doctor.email,
        specialization: group.doctor.specialization,
        icon: <MedicineBoxOutlined />,
        label: 'Doctor',
      };
    }
  };

  // Get status tag color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'approved':
        return 'blue';
      case 'pending':
        return 'orange';
      case 'reject':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="grouped-appointments-container">
      <Collapse
        activeKey={activeKeys}
        onChange={setActiveKeys}
        className="grouped-collapse"
        expandIcon={() => null}
      >
        {groupedData.map((group, index) => {
          const personInfo = getPersonInfo(group);
          const stats = group.statistics;
          const panelKey = String(index);
          const isActive = activeKeys.includes(panelKey);

          return (
            <Panel
              key={panelKey}
              header={
                <div className="group-header">
                  <div className="group-header-top">
                    <div className="person-icon">{personInfo.icon}</div>
                    <div className="person-info">
                      <div className="person-name">{personInfo.name}</div>
                      <div className="person-meta">
                        {personInfo.specialization && (
                          <span className="specialization">
                            {personInfo.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="group-header-bottom">
                    <div className="group-stats-container">
                      <div className="group-stats">
                        <Tag color="blue" className="stat-badge">{stats.totalAppointments} visits</Tag>
                        {stats.totalDocuments > 0 && (
                          <Tag color="blue" className="stat-badge">{stats.totalDocuments} docs</Tag>
                        )}
                      </div>
                      {/* Add a line between stats and arrow */}
                      <div style={{ width: '80%', height: '1px', background: '#e4e4e4' , margin: '1px auto' }} />
                      {isActive ? (
                        <UpOutlined className="expand-icon" /> 
                      ) : (
                        <DownOutlined className="expand-icon" />
                      )}
                    </div>
                  </div>
                </div>
              }
              className="group-panel"
            >
              {/* AI Summary Placeholder - shown for patients with 1+ approved appointments */}
              {stats.showAISummary && <AISummaryPlaceholder compact={true} />}

              {/* Appointments List */}
              <div className="appointments-list">
                {group.appointments.map((appointment) => (
                  <Card
                    key={appointment._id}
                    className="appointment-item-card"
                    size="small"
                  >
                    <div className="appointment-item-header">
                      <div className="appointment-date">
                        <CalendarOutlined />
                        <span>
                          {formatAppointmentTime(appointment).displayDate}
                        </span>
                      </div>
                      <Tag color={getStatusColor(appointment.status)} className="status-tag">
                        {appointment.status}
                      </Tag>
                    </div>

                    {appointment.documents && appointment.documents.length > 0 && (
                      <div className="appointment-documents">
                        <FileTextOutlined /> {appointment.documents.length}{' '}
                        document{appointment.documents.length > 1 ? 's' : ''}
                      </div>
                    )}

                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => onViewDetails(appointment)}
                      className="view-details-btn"
                      block
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};

export default GroupedAppointments;
