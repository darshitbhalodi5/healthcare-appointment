const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  approveProfileUpdateController,
  deleteDoctorController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

//GET METHOD || DOCTORS
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//POST ACCOUNT STATUS (initial approval only)
router.post(
  "/changeAccountStatus",
  authMiddleware,
  changeAccountStatusController
);

//POST PROFILE UPDATE APPROVAL (approve or reject profile updates)
router.post(
  "/approveProfileUpdate",
  authMiddleware,
  approveProfileUpdateController
);

//DELETE DOCTOR
router.delete(
  "/deleteDoctor",
  authMiddleware,
  deleteDoctorController
);

module.exports = router;