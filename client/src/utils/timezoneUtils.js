import moment from 'moment-timezone';

/**
 * Get user's browser timezone
 * @returns {string} Timezone string like "America/New_York"
 */
export const getUserTimezone = () => {
  return moment.tz.guess();
};

/**
 * Convert local datetime to UTC
 * @param {string} date - Date in DD-MM-YYYY format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - Timezone string
 * @returns {Date} UTC Date object
 */
export const localToUTC = (date, time, timezone) => {
  // Parse DD-MM-YYYY to YYYY-MM-DD
  const [day, month, year] = date.split('-');
  const dateStr = `${year}-${month}-${day}`;
  const dateTimeStr = `${dateStr} ${time}`;

  // Create moment in user's timezone and convert to UTC
  return moment.tz(dateTimeStr, 'YYYY-MM-DD HH:mm', timezone).utc().toDate();
};

/**
 * Convert UTC datetime to local timezone
 * @param {Date|string} utcDateTime - UTC Date object or ISO string
 * @param {string} timezone - Target timezone
 * @returns {object} Object with date and time in local timezone
 */
export const utcToLocal = (utcDateTime, timezone) => {
  const localMoment = moment.utc(utcDateTime).tz(timezone);

  return {
    date: localMoment.format('DD-MM-YYYY'),
    time: localMoment.format('HH:mm'),
    displayDate: localMoment.format('DD MMM YYYY'),
    displayTime: localMoment.format('hh:mm A'),
  };
};

/**
 * Generate time slots based on doctor's working hours
 * @param {string} startTime - Start time in HH:mm format (e.g., "09:00")
 * @param {string} endTime - End time in HH:mm format (e.g., "17:00")
 * @returns {Array} Array of hour blocks with nested 10-min slots
 */
export const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  for (let hour = startHour; hour < endHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const tenMinSlots = [];

    // Generate 6 slots of 10 minutes each for this hour
    for (let min = 0; min < 60; min += 10) {
      const minStr = min.toString().padStart(2, '0');
      tenMinSlots.push(`${hourStr}:${minStr}`);
    }

    slots.push({
      hour: `${hourStr}:00`,
      displayHour: `${hourStr}:00`,
      slots: tenMinSlots,
    });
  }

  return slots;
};

/**
 * Check if a time slot is in the past
 * @param {string} date - Date in DD-MM-YYYY format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - Timezone string
 * @returns {boolean} True if slot is in the past
 */
export const isSlotInPast = (date, time, timezone) => {
  const [day, month, year] = date.split('-');
  const dateStr = `${year}-${month}-${day}`;
  const dateTimeStr = `${dateStr} ${time}`;

  const slotTime = moment.tz(dateTimeStr, 'YYYY-MM-DD HH:mm', timezone);
  const now = moment.tz(timezone);

  return slotTime.isBefore(now);
};

/**
 * Format time for display (12-hour format)
 * @param {string} time - Time in HH:mm format
 * @returns {string} Formatted time like "9:00 AM"
 */
export const formatTimeDisplay = (time) => {
  return moment(time, 'HH:mm').format('h:mm A');
};

/**
 * Get display timezone name
 * @param {string} timezone - Timezone string
 * @returns {string} Short timezone name like "EST", "PST"
 */
export const getTimezoneAbbr = (timezone) => {
  return moment.tz(timezone).format('z');
};

/**
 * Format appointment date/time for display in user's timezone
 * @param {object} appointment - Appointment object with dateTimeUTC field
 * @returns {object} Formatted date and time for display
 */
export const formatAppointmentTime = (appointment) => {
  // If dateTimeUTC exists, use it (new appointments with timezone support)
  if (appointment.dateTimeUTC) {
    const userTimezone = getUserTimezone();
    const localTime = moment.utc(appointment.dateTimeUTC).tz(userTimezone);

    return {
      date: localTime.format('DD-MM-YYYY'),
      time: localTime.format('HH:mm'),
      displayDate: localTime.format('DD MMM YYYY'),
      displayTime: localTime.format('h:mm A'),
      hasTimezone: true,
    };
  }

  // Fallback for old appointments without dateTimeUTC
  return {
    date: appointment.date,
    time: appointment.time,
    displayDate: moment(appointment.date, 'DD-MM-YYYY').format('DD MMM YYYY'),
    displayTime: moment(appointment.time, 'HH:mm').format('h:mm A'),
    hasTimezone: false,
  };
};

/**
 * Convert UTC time string (HH:mm) to local timezone time string (HH:mm)
 * Uses today's date as reference for conversion
 * @param {string} utcTime - Time in HH:mm format (UTC)
 * @param {string} timezone - Target timezone
 * @returns {string} Time in HH:mm format (local timezone)
 */
export const utcTimeToLocalTime = (utcTime, timezone) => {
  // Use today's date as reference
  const today = moment().format('YYYY-MM-DD');
  const utcDateTime = moment.utc(`${today} ${utcTime}`, 'YYYY-MM-DD HH:mm');
  const localDateTime = utcDateTime.tz(timezone);
  return localDateTime.format('HH:mm');
};

/**
 * Convert local timezone time string (HH:mm) to UTC time string (HH:mm)
 * Uses today's date as reference for conversion
 * @param {string} localTime - Time in HH:mm format (local timezone)
 * @param {string} timezone - Source timezone
 * @returns {string} Time in HH:mm format (UTC)
 */
export const localTimeToUTCTime = (localTime, timezone) => {
  // Use today's date as reference
  const today = moment().format('YYYY-MM-DD');
  const localDateTime = moment.tz(`${today} ${localTime}`, 'YYYY-MM-DD HH:mm', timezone);
  const utcDateTime = localDateTime.utc();
  return utcDateTime.format('HH:mm');
};

/**
 * Get timezone abbreviation for display
 * @param {string} timezone - Timezone string
 * @returns {string} Timezone abbreviation like "EST", "PST", "IST"
 */
export const getTimezoneDisplayName = (timezone) => {
  return moment.tz(timezone).format('z');
};
