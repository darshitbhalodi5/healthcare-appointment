const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const { sendPushToUser } = require("./pushNotificationCtrl");
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileController = async (req, res) => {
  try {
    const { userId, directUpdate, adminApproval } = req.body;

    // Find the doctor
    const doctor = await doctorModel.findOne({ userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    let updateMessage = "";

    // Apply direct updates (fields that don't require admin approval)
    if (directUpdate && Object.keys(directUpdate).length > 0) {
      Object.keys(directUpdate).forEach((key) => {
        doctor[key] = directUpdate[key];
      });
      updateMessage = "Profile updated successfully";
    }

    // Handle fields requiring admin approval
    if (adminApproval && Object.keys(adminApproval).length > 0) {
      // Store pending changes separately (DO NOT change status to "pending")
      // Doctor remains "approved" and can continue practicing
      doctor.pendingUpdates = {
        ...adminApproval,
        requestedAt: new Date(),
        requestedBy: userId,
      };
      doctor.hasPendingUpdates = true;

      // Notify admin about the profile update request
      const adminUser = await userModel.findOne({ isAdmin: true });

      if (adminUser) {
        const notifcation = adminUser.notifcation || [];
        notifcation.push({
          type: "doctor-profile-update-request",
          message: `Dr. ${doctor.firstName} ${doctor.lastName} has requested profile updates for review`,
          data: {
            doctorId: doctor._id,
            name: doctor.firstName + " " + doctor.lastName,
            updates: adminApproval,
            onClickPath: "/admin/docotrs",
          },
        });
        await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
      }

      updateMessage = updateMessage
        ? "Profile updated. Changes requiring approval have been submitted for admin review. You can continue practicing while the update is being reviewed."
        : "Profile changes submitted for admin approval. You can continue practicing while the update is being reviewed.";
    }

    await doctor.save();

    res.status(200).send({
      success: true,
      message: updateMessage,
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};

//get single docotor
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Sigle Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Erro in Single docot info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });

    // Fetch patient names for all appointments
    const userIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))];
    console.log('User IDs from appointments:', userIds);

    const users = await userModel.find({ _id: { $in: userIds } });
    console.log('Users found:', users.length);

    const userMap = {};
    users.forEach(user => {
      const key = user._id.toString();
      const name = `${user.firstName} ${user.lastName}`;
      userMap[key] = name;
      console.log(`Mapped: ${key} -> ${name}`);
    });

    // Add patient name to each appointment
    const appointmentsWithPatientNames = appointments.map(appointment => {
      const appt = appointment.toObject();
      appt.patientName = userMap[appointment.userId] || 'Not assigned';
      console.log(`Appointment ${appt._id}: userId=${appointment.userId}, patientName=${appt.patientName}`);
      return appt;
    });

    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: appointmentsWithPatientNames,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doc Appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "status-updated",
      message: `your appointment has been updated ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();

    // Send push notification to patient
    await sendPushToUser(appointments.userId, {
      title: '🏥 Appointment Status Update',
      body: `Your appointment has been ${status}`,
      url: '/appointments'
    });

    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};

// Get appointments grouped by patient
const doctorGroupedAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get all appointments for this doctor
    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .populate('documents.uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Get unique user IDs
    const userIds = [...new Set(appointments.map(a => a.userId).filter(Boolean))];

    // Fetch all users (patients)
    const users = await userModel.find({ _id: { $in: userIds } });

    // Create a map of userId -> user info
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });

    // Group appointments by patient
    const groupedByPatient = {};

    appointments.forEach(appointment => {
      // Skip if no userId
      if (!appointment.userId) {
        return;
      }

      const patientId = appointment.userId;
      const patient = userMap[patientId];

      // Skip if patient not found
      if (!patient) {
        return;
      }

      if (!groupedByPatient[patientId]) {
        groupedByPatient[patientId] = {
          patient: {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
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

      groupedByPatient[patientId].appointments.push(appointment);
      groupedByPatient[patientId].statistics.totalAppointments++;

      // Update statistics
      if (appointment.status === 'completed') {
        groupedByPatient[patientId].statistics.completedAppointments++;
      }
      if (appointment.status === 'approved' || appointment.status === 'pending') {
        groupedByPatient[patientId].statistics.upcomingAppointments++;
      }

      groupedByPatient[patientId].statistics.totalDocuments += appointment.documents?.length || 0;

      // Track first and last visit dates
      const appointmentDate = appointment.createdAt;
      if (!groupedByPatient[patientId].statistics.firstVisit ||
          appointmentDate < groupedByPatient[patientId].statistics.firstVisit) {
        groupedByPatient[patientId].statistics.firstVisit = appointmentDate;
      }
      if (!groupedByPatient[patientId].statistics.lastVisit ||
          appointmentDate > groupedByPatient[patientId].statistics.lastVisit) {
        groupedByPatient[patientId].statistics.lastVisit = appointmentDate;
      }
    });

    // Convert to array and sort by last visit
    const groupedArray = Object.values(groupedByPatient).sort((a, b) => {
      return new Date(b.statistics.lastVisit) - new Date(a.statistics.lastVisit);
    });

    // Debug logging
    console.log('=== DOCTOR GROUPED APPOINTMENTS DEBUG ===');
    console.log('Total appointments found:', appointments.length);
    console.log('Number of patient groups:', groupedArray.length);
    console.log('Groups:', groupedArray.map(g => ({
      patient: `${g.patient.firstName} ${g.patient.lastName}`,
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

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  doctorGroupedAppointmentsController,
};