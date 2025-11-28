const express = require("express");
const {
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
} = require("../controllers/userCtrl");
const { subscribePush } = require("../controllers/pushNotificationCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//SEND OTP || POST
router.post("/send-otp", sendOTPController);

//VERIFY OTP || POST
router.post("/verify-otp", verifyOTPController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

router.post(
  "/mark-notification-read",
  authMiddleware,
  markNotificationReadController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDocotrsController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);

//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);

//Push Notification Subscription
router.post("/subscribe-push", authMiddleware, subscribePush);

module.exports = router;