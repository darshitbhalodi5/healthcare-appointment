const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const { generateOTP, sendOTPEmail } = require("../utils/emailService");
const { sendPushToUser } = require("./pushNotificationCtrl");

// Step 1: Send OTP to email
const sendOTPController = async (req, res) => {
  try {
    const { email, firstName } = req.body;

    // Check if user already exists
    let existingUser = await userModel.findOne({ email });

    if (existingUser && existingUser.emailVerified) {
      // User already registered and verified
      return res.status(200).send({
        message: "User with this email already exists. Please login.",
        success: false
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.emailVerified) {
      // Update existing unverified user with new OTP
      existingUser.emailOTP = otp;
      existingUser.emailOTPExpiry = otpExpiry;
      if (firstName) existingUser.firstName = firstName;
      await existingUser.save();
    } else {
      // Create new temp user with OTP
      existingUser = new userModel({
        email,
        firstName: firstName || "User",
        lastName: "Temp",
        password: "temp123", // Temporary password
        address: "temp",
        dateOfBirth: new Date(),
        mobileNumber: "0000000000",
        emailOTP: otp,
        emailOTPExpiry: otpExpiry,
        emailVerified: false,
      });
      await existingUser.save();
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, firstName || existingUser.firstName);

    if (emailResult.success) {
      res.status(200).send({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } else {
      res.status(500).send({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error sending OTP: ${error.message}`,
    });
  }
};

// Step 2: Verify OTP
const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email, emailVerified: false });

    if (!user) {
      return res.status(200).send({
        message: "User not found or already verified",
        success: false,
      });
    }

    // Check if OTP is expired
    if (user.emailOTPExpiry < new Date()) {
      return res.status(200).send({
        message: "OTP has expired. Please request a new one.",
        success: false,
      });
    }

    // Verify OTP
    if (user.emailOTP !== otp) {
      return res.status(200).send({
        message: "Invalid OTP. Please try again.",
        success: false,
      });
    }

    // OTP verified successfully
    res.status(200).send({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error verifying OTP: ${error.message}`,
    });
  }
};

// Step 3: Complete registration
const registerController = async (req, res) => {
  try {
    const { email, firstName, lastName, address, dateOfBirth, mobileNumber, password, confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.status(200).send({
        message: "Passwords do not match",
        success: false,
      });
    }

    // Find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).send({
        message: "Email not verified. Please verify your email first.",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(200).send({
        message: "User already registered",
        success: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with complete information
    user.firstName = firstName;
    user.lastName = lastName;
    user.address = address;
    user.dateOfBirth = dateOfBirth;
    user.mobileNumber = mobileNumber;
    user.password = hashedPassword;
    user.emailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;

    await user.save();

    res.status(201).send({
      message: "Registration completed successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res
        .status(200)
        .send({ message: "Please verify your email first to login", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Email or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });

    if (!adminUser) {
      return res.status(404).send({
        success: false,
        message: "Admin user not found",
      });
    }

    const notifcation = adminUser.notifcation || [];
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = seennotification;
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};

//BOOK APPOINTMENT
const bookeAppointmnetController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A new Appointment Request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();

    // Send push notification to doctor
    await sendPushToUser(req.body.doctorInfo.userId, {
      title: '📅 New Appointment Request',
      body: `${req.body.userInfo.name} has requested an appointment`,
      url: '/doctor-appointments'
    });

    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.userId,
    });

    // Fetch doctor names for all appointments
    const doctorIds = [...new Set(appointments.map(a => a.doctorId).filter(Boolean))];
    console.log('Doctor IDs from appointments:', doctorIds);

    const doctors = await doctorModel.find({ _id: { $in: doctorIds } });
    console.log('Doctors found:', doctors.length);

    const doctorMap = {};
    doctors.forEach(doctor => {
      const key = doctor._id.toString();
      const name = `Dr. ${doctor.firstName} ${doctor.lastName}`;
      doctorMap[key] = name;
      console.log(`Mapped: ${key} -> ${name}`);
    });

    // Add doctor name to each appointment
    const appointmentsWithDoctorNames = appointments.map(appointment => {
      const appt = appointment.toObject();
      appt.doctorName = doctorMap[appointment.doctorId] || 'Not assigned';
      console.log(`Appointment ${appt._id}: doctorId=${appointment.doctorId}, doctorName=${appt.doctorName}`);
      return appt;
    });

    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointmentsWithDoctorNames,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

// Get appointments grouped by doctor
const userGroupedAppointmentsController = async (req, res) => {
  try {
    // Get all appointments for this user
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .populate('documents.uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Get unique doctor IDs
    const doctorIds = [...new Set(appointments.map(a => a.doctorId).filter(Boolean))];

    // Fetch all doctors
    const doctors = await doctorModel.find({ _id: { $in: doctorIds } });

    // Create a map of doctorId -> doctor info
    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor._id.toString()] = doctor;
    });

    // Group appointments by doctor
    const groupedByDoctor = {};

    appointments.forEach(appointment => {
      // Skip if no doctorId
      if (!appointment.doctorId) {
        return;
      }

      const doctorId = appointment.doctorId;
      const doctor = doctorMap[doctorId];

      // Skip if doctor not found
      if (!doctor) {
        return;
      }

      if (!groupedByDoctor[doctorId]) {
        groupedByDoctor[doctorId] = {
          doctor: {
            _id: doctor._id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            email: doctor.email,
            specialization: doctor.specialization,
            phone: doctor.phone,
          },
          appointments: [],
          statistics: {
            totalAppointments: 0,
            completedAppointments: 0,
            upcomingAppointments: 0,
            totalDocuments: 0,
            lastVisit: null,
            firstVisit: null,
          },
        };
      }

      groupedByDoctor[doctorId].appointments.push(appointment);
      groupedByDoctor[doctorId].statistics.totalAppointments++;

      // Update statistics
      if (appointment.status === 'completed') {
        groupedByDoctor[doctorId].statistics.completedAppointments++;
      }
      if (appointment.status === 'approved' || appointment.status === 'pending') {
        groupedByDoctor[doctorId].statistics.upcomingAppointments++;
      }

      groupedByDoctor[doctorId].statistics.totalDocuments += appointment.documents?.length || 0;

      // Track first and last visit dates
      const appointmentDate = appointment.createdAt;
      if (!groupedByDoctor[doctorId].statistics.firstVisit ||
          appointmentDate < groupedByDoctor[doctorId].statistics.firstVisit) {
        groupedByDoctor[doctorId].statistics.firstVisit = appointmentDate;
      }
      if (!groupedByDoctor[doctorId].statistics.lastVisit ||
          appointmentDate > groupedByDoctor[doctorId].statistics.lastVisit) {
        groupedByDoctor[doctorId].statistics.lastVisit = appointmentDate;
      }
    });

    // Convert to array and sort by last visit
    const groupedArray = Object.values(groupedByDoctor).sort((a, b) => {
      return new Date(b.statistics.lastVisit) - new Date(a.statistics.lastVisit);
    });

    // Debug logging
    console.log('=== PATIENT GROUPED APPOINTMENTS DEBUG ===');
    console.log('Total appointments found:', appointments.length);
    console.log('Number of doctor groups:', groupedArray.length);
    console.log('Groups:', groupedArray.map(g => ({
      doctor: `Dr. ${g.doctor.firstName} ${g.doctor.lastName}`,
      appointmentCount: g.appointments.length
    })));

    res.status(200).send({
      success: true,
      message: "Grouped appointments fetched successfully",
      data: groupedArray,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching grouped appointments",
    });
  }
};

const markNotificationReadController = async (req, res) => {
  try {
    const { userId, notificationIndex } = req.body;
    const user = await userModel.findOne({ _id: userId });
    if (
      notificationIndex === undefined ||
      notificationIndex < 0 ||
      notificationIndex >= user.notifcation.length
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid notification index",
      });
    }
    const [notification] = user.notifcation.splice(notificationIndex, 1);
    user.seennotification.push(notification);
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable to update notification",
      error,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  sendOTPController,
  verifyOTPController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  markNotificationReadController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  userGroupedAppointmentsController,
};
