const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
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
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: appointments,
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

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
};