import React, { useState, useEffect } from 'react';
import { LeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import moment from 'moment-timezone';
import {
  generateTimeSlots,
  formatTimeDisplay,
  getUserTimezone,
  getTimezoneAbbr,
  isSlotInPast,
} from '../utils/timezoneUtils';
import './TimeSlotPicker.css';

const TimeSlotPicker = ({
  selectedDate,
  doctorTimings,
  bookedSlots = [],
  onTimeSelect,
  selectedTime,
  onBack,
  loading = false,
}) => {
  const [expandedHour, setExpandedHour] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const userTimezone = getUserTimezone();

  useEffect(() => {
    if (doctorTimings && doctorTimings[0] && doctorTimings[1]) {
      const slots = generateTimeSlots(doctorTimings[0], doctorTimings[1]);
      setTimeSlots(slots);
    }
  }, [doctorTimings]);

  const handleHourClick = (hour) => {
    if (expandedHour === hour) {
      setExpandedHour(null);
    } else {
      setExpandedHour(hour);
    }
  };

  const handleTimeSlotClick = (time) => {
    // Check if slot is in the past
    if (isSlotInPast(selectedDate, time, userTimezone)) {
      return;
    }

    // Check if slot is booked
    if (isSlotBooked(time)) {
      return;
    }

    onTimeSelect(time);
  };

  const isSlotBooked = (time) => {
    return bookedSlots.includes(time);
  };

  const getHourAvailability = (hourBlock) => {
    const availableSlots = hourBlock.slots.filter((slot) => {
      const isPast = isSlotInPast(selectedDate, slot, userTimezone);
      const isBooked = isSlotBooked(slot);
      return !isPast && !isBooked;
    });

    return {
      total: hourBlock.slots.length,
      available: availableSlots.length,
    };
  };

  if (loading) {
    return (
      <div className="time-slot-picker">
        <div className="time-slot-header">
          <button className="back-button" onClick={onBack}>
            <LeftOutlined />
          </button>
          <div className="time-slot-title">
            <h3>Select a Time</h3>
            <p className="selected-date-display">
              {moment(selectedDate, 'DD-MM-YYYY').format('dddd, MMMM D, YYYY')}
            </p>
          </div>
        </div>
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-slot-picker">
      <div className="time-slot-header">
        <button className="back-button" onClick={onBack}>
          <LeftOutlined />
        </button>
        <div className="time-slot-title">
          <h3>Select a Time</h3>
          <p className="selected-date-display">
            {moment(selectedDate, 'DD-MM-YYYY').format('dddd, MMMM D, YYYY')}
          </p>
        </div>
      </div>

      <div className="timezone-info">
        <ClockCircleOutlined />
        <span>
          Time zone: {userTimezone} ({getTimezoneAbbr(userTimezone)})
        </span>
      </div>

      <div className="duration-info">
        <span>Duration: 10 min</span>
      </div>

      <div className="time-slots-container">
        {timeSlots.length === 0 ? (
          <div className="no-slots">
            <p>No time slots available for this doctor</p>
          </div>
        ) : (
          timeSlots.map((hourBlock) => {
            const availability = getHourAvailability(hourBlock);
            const isExpanded = expandedHour === hourBlock.hour;
            const hasAvailableSlots = availability.available > 0;

            return (
              <div key={hourBlock.hour} className="hour-block">
                <button
                  className={`hour-button ${!hasAvailableSlots ? 'disabled' : ''} ${
                    isExpanded ? 'expanded' : ''
                  }`}
                  onClick={() => hasAvailableSlots && handleHourClick(hourBlock.hour)}
                  disabled={!hasAvailableSlots}
                >
                  <span className="hour-time">{formatTimeDisplay(hourBlock.hour)}</span>
                  {hasAvailableSlots ? (
                    <span className="availability-badge">
                      {availability.available}/{availability.total} available
                    </span>
                  ) : (
                    <span className="availability-badge no-slots-badge">Full</span>
                  )}
                </button>

                {isExpanded && (
                  <div className="ten-min-slots">
                    {hourBlock.slots.map((slot) => {
                      const isPast = isSlotInPast(selectedDate, slot, userTimezone);
                      const isBooked = isSlotBooked(slot);
                      const isSelected = selectedTime === slot;
                      const isDisabled = isPast || isBooked;

                      return (
                        <button
                          key={slot}
                          className={`time-slot-button ${isSelected ? 'selected' : ''} ${
                            isDisabled ? 'disabled' : ''
                          }`}
                          onClick={() => handleTimeSlotClick(slot)}
                          disabled={isDisabled}
                        >
                          {formatTimeDisplay(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
