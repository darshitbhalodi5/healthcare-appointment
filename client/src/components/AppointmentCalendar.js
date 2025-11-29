import React, { useState } from 'react';
import moment from 'moment';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './AppointmentCalendar.css';

const AppointmentCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());

  // Generate calendar days for current month
  const generateCalendar = () => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const calendar = [];
    const day = startDate.clone();

    while (day.isBefore(endDate, 'day')) {
      calendar.push({
        date: day.clone(),
        isCurrentMonth: day.month() === currentMonth.month(),
        isPast: day.isBefore(moment(), 'day'),
        isToday: day.isSame(moment(), 'day'),
        isSelected: selectedDate && day.isSame(moment(selectedDate, 'DD-MM-YYYY'), 'day'),
      });
      day.add(1, 'day');
    }

    return calendar;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const handleDateClick = (dateObj) => {
    if (dateObj.isPast && !dateObj.isToday) {
      return; // Don't allow past dates
    }
    onDateSelect(dateObj.date.format('DD-MM-YYYY'));
  };

  const calendarDays = generateCalendar();
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="appointment-calendar">
      <div className="calendar-header">
        <h3>Select a Day</h3>
      </div>

      <div className="calendar-controls">
        <button className="nav-button" onClick={handlePrevMonth}>
          <LeftOutlined />
        </button>
        <div className="month-year">
          {currentMonth.format('MMMM YYYY')}
        </div>
        <button className="nav-button" onClick={handleNextMonth}>
          <RightOutlined />
        </button>
      </div>

      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((dateObj, index) => (
          <div
            key={index}
            className={`calendar-day ${
              !dateObj.isCurrentMonth ? 'other-month' : ''
            } ${dateObj.isPast && !dateObj.isToday ? 'past-date' : ''} ${
              dateObj.isToday ? 'today' : ''
            } ${dateObj.isSelected ? 'selected' : ''}`}
            onClick={() => handleDateClick(dateObj)}
          >
            {dateObj.date.date()}
            {dateObj.isToday && <div className="today-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
