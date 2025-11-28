const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const { sendPushToUser } = require("./pushNotificationCtrl");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "erorr while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

// doctor account status (ONLY for initial account approval)
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Only allow changing status for pending accounts (initial approval)
    // This prevents accidentally changing an approved doctor's status
    if (doctor.status !== "pending") {
      return res.status(400).send({
        success: false,
        message: "Can only approve/reject pending doctor applications. Use update approval for profile changes.",
      });
    }

    // Update doctor status
    doctor.status = status;
    await doctor.save();

    // Update user document
    const user = await userModel.findOne({ _id: doctor.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account Request Has ${status}`,
      onClickPath: "/notification",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();

    // Send push notification to doctor
    await sendPushToUser(doctor.userId, {
      title: status === "approved" ? '🎉 Doctor Account Approved!' : '❌ Doctor Account Rejected',
      body: `Your doctor account request has been ${status}`,
      url: '/notification'
    });

    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Account Status",
      error,
    });
  }
};

// Approve or Reject Profile Update (keeps doctor approved)
const approveProfileUpdateController = async (req, res) => {
  try {
    const { doctorId, action } = req.body;

    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.hasPendingUpdates) {
      return res.status(400).send({
        success: false,
        message: "No pending updates to review",
      });
    }

    const user = await userModel.findOne({ _id: doctor.userId });

    if (action === "approve") {
      // Apply pending updates to actual fields
      if (doctor.pendingUpdates) {
        Object.keys(doctor.pendingUpdates).forEach((key) => {
          if (key !== "requestedAt" && key !== "requestedBy") {
            doctor[key] = doctor.pendingUpdates[key];
          }
        });
      }

      // Clear pending updates
      doctor.pendingUpdates = null;
      doctor.hasPendingUpdates = false;
      await doctor.save();

      // Notify doctor
      const notifcation = user.notifcation;
      notifcation.push({
        type: "profile-update-approved",
        message: "Your profile update has been approved by admin",
        onClickPath: "/doctor/profile",
      });
      await user.save();

      // Send push notification
      await sendPushToUser(doctor.userId, {
        title: '✅ Profile Update Approved',
        body: 'Your profile update has been approved by admin',
        url: '/doctor/profile'
      });

      return res.status(200).send({
        success: true,
        message: "Profile update approved successfully",
        data: doctor,
      });

    } else if (action === "reject") {
      // Discard pending updates (keep old values)
      doctor.pendingUpdates = null;
      doctor.hasPendingUpdates = false;
      await doctor.save();

      // Notify doctor
      const notifcation = user.notifcation;
      notifcation.push({
        type: "profile-update-rejected",
        message: "Your profile update has been rejected by admin. Your current profile information remains unchanged.",
        onClickPath: "/doctor/profile",
      });
      await user.save();

      // Send push notification
      await sendPushToUser(doctor.userId, {
        title: '❌ Profile Update Rejected',
        body: 'Your profile update has been rejected. Current profile remains unchanged.',
        url: '/doctor/profile'
      });

      return res.status(200).send({
        success: true,
        message: "Profile update rejected successfully",
        data: doctor,
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Invalid action. Use 'approve' or 'reject'",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Profile Update Approval",
      error,
    });
  }
};

// Delete Doctor Permanently
const deleteDoctorController = async (req, res) => {
  try {
    const { doctorId, userId } = req.body;

    // Find doctor document first to get userId
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    // Use doctor's userId (more reliable than passed userId)
    const doctorUserId = doctor.userId || userId;

    // Delete doctor document
    await doctorModel.findByIdAndDelete(doctorId);

    // Update user document - remove doctor privileges
    if (doctorUserId) {
      const user = await userModel.findById(doctorUserId);
      if (user) {
        // Set isDoctor to false
        user.isDoctor = false;
        
        // Add notification to user
        const notifcation = user.notifcation || [];
        notifcation.push({
          type: "doctor-account-deleted",
          message: "Your doctor account has been deleted by admin. You are now a regular user.",
          onClickPath: "/notification",
        });
        user.notifcation = notifcation;
        
        await user.save();
      }
    }

    res.status(200).send({
      success: true,
      message: "Doctor deleted successfully and user converted to regular user",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error deleting doctor",
      error,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,
  changeAccountStatusController,
  approveProfileUpdateController,
  deleteDoctorController,
};