const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload, handleMulterError } = require("../middlewares/uploadMiddleware");
const {
  uploadDocumentController,
  getDocumentsController,
  downloadDocumentController,
  replaceDocumentController,
  addDocumentCommentController,
  updateGeneralNotesController,
  deleteDocumentController,
} = require("../controllers/documentCtrl");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// 1. Upload Document
// POST /api/v1/appointment/:appointmentId/upload-document
router.post(
  "/:appointmentId/upload-document",
  upload.single('file'),
  handleMulterError,
  uploadDocumentController
);

// 2. Get All Documents for Appointment
// GET /api/v1/appointment/:appointmentId/documents
router.get(
  "/:appointmentId/documents",
  getDocumentsController
);

// 3. Download Document
// GET /api/v1/appointment/:appointmentId/document/:documentId/download
router.get(
  "/:appointmentId/document/:documentId/download",
  downloadDocumentController
);

// 4. Replace Document (Patient only, before appointment)
// PUT /api/v1/appointment/:appointmentId/document/:documentId/replace
router.put(
  "/:appointmentId/document/:documentId/replace",
  upload.single('file'),
  handleMulterError,
  replaceDocumentController
);

// 5. Add Comment to Document (Doctor only)
// POST /api/v1/appointment/:appointmentId/document/:documentId/comment
router.post(
  "/:appointmentId/document/:documentId/comment",
  addDocumentCommentController
);

// 6. Update General Notes (Doctor only)
// PUT /api/v1/appointment/:appointmentId/notes
router.put(
  "/:appointmentId/notes",
  updateGeneralNotesController
);

// 7. Delete Document (Admin only)
// DELETE /api/v1/appointment/:appointmentId/document/:documentId
router.delete(
  "/:appointmentId/document/:documentId",
  deleteDocumentController
);

module.exports = router;
