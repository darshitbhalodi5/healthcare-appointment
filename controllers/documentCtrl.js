const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModels");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

// Helper function to determine document category
const determineCategory = (appointmentDateTime) => {
  if (!appointmentDateTime) {
    return 'pre-appointment';
  }

  const now = moment();
  const apptTime = moment(appointmentDateTime);

  return now.isBefore(apptTime) ? 'pre-appointment' : 'post-appointment';
};

// Helper function to get file type
const getFileType = (mimeType) => {
  if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (mimeType.startsWith('image/')) {
    return 'image';
  }
  return 'unknown';
};

// Helper function to move file to correct category folder
const moveFileToCategory = (currentPath, appointmentId, category, filename) => {
  const categoryPath = path.join(__dirname, '..', 'uploads', 'appointments', appointmentId, category);

  // Create category directory if it doesn't exist
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }

  const newPath = path.join(categoryPath, filename);

  // Move file from temp location to category folder
  fs.renameSync(currentPath, newPath);

  return newPath;
};

// 1. Upload Document Controller
const uploadDocumentController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.body.userId;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find user to check role
    const user = await userModel.findById(userId);

    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Determine uploader role
    let uploaderRole;
    if (appointment.userId === userId) {
      uploaderRole = 'patient';
    } else if (appointment.doctorId === userId && user.isDoctor) {
      uploaderRole = 'doctor';
    } else {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to upload documents to this appointment",
      });
    }

    // Check permissions based on role and status
    if (uploaderRole === 'patient') {
      if (appointment.status === 'reject') {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: "Cannot upload documents to a rejected appointment",
        });
      }
    } else if (uploaderRole === 'doctor') {
      if (appointment.status !== 'approved') {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: "Doctor can only upload documents after approving the appointment",
        });
      }
    }

    // Compute appointment date-time if not already set
    if (!appointment.appointmentDateTime && appointment.date && appointment.time) {
      const dateTimeString = `${appointment.date} ${appointment.time}`;
      appointment.appointmentDateTime = moment(dateTimeString, "DD-MM-YYYY HH:mm").toDate();
      await appointment.save();
    }

    // Determine category
    const category = determineCategory(appointment.appointmentDateTime);

    // Move file to category folder
    const newFilePath = moveFileToCategory(
      req.file.path,
      appointmentId,
      category,
      req.file.filename
    );

    // Create document object
    const documentObj = {
      filename: req.originalFilename || req.file.originalname,
      storedFilename: req.file.filename,
      filepath: newFilePath,
      fileType: getFileType(req.file.mimetype),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: userId,
      uploaderRole: uploaderRole,
      uploadedAt: new Date(),
      category: category,
      comments: [],
    };

    // Add document to appointment
    appointment.documents.push(documentObj);
    await appointment.save();

    // Get the newly added document (last one in array)
    const addedDocument = appointment.documents[appointment.documents.length - 1];

    // Populate uploadedBy field
    const populatedAppointment = await appointmentModel
      .findById(appointmentId)
      .populate('documents.uploadedBy', 'firstName lastName email');

    const populatedDocument = populatedAppointment.documents.id(addedDocument._id);

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: populatedDocument,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error uploading document",
      error: error.message,
    });
  }
};

// 2. Get All Documents for Appointment
const getDocumentsController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.body.userId;

    // Find appointment and populate user references
    const appointment = await appointmentModel
      .findById(appointmentId)
      .populate('documents.uploadedBy', 'firstName lastName email')
      .populate('documents.comments.userId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find user to check role
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check authorization
    const isPatient = appointment.userId === userId;
    const isDoctor = appointment.doctorId === userId && user.isDoctor;
    const isAdmin = user.isAdmin;

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these documents",
      });
    }

    res.status(200).json({
      success: true,
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        date: appointment.date,
        time: appointment.time,
        generalNotes: appointment.generalNotes,
        documents: appointment.documents,
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving documents",
      error: error.message,
    });
  }
};

// 3. Download Document
const downloadDocumentController = async (req, res) => {
  try {
    const { appointmentId, documentId } = req.params;
    const userId = req.body.userId;

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find user to check role
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check authorization
    const isPatient = appointment.userId === userId;
    const isDoctor = appointment.doctorId === userId && user.isDoctor;
    const isAdmin = user.isAdmin;

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this document",
      });
    }

    // Find document
    const document = appointment.documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filepath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);

    // Stream file
    const fileStream = fs.createReadStream(document.filepath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading document",
      error: error.message,
    });
  }
};

// 4. Replace Document (Patient only, before appointment)
const replaceDocumentController = async (req, res) => {
  try {
    const { appointmentId, documentId } = req.params;
    const userId = req.body.userId;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find document
    const document = appointment.documents.id(documentId);

    if (!document) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if user is the patient
    if (appointment.userId !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: "Only the patient can replace documents",
      });
    }

    // Check if user is the original uploader
    if (document.uploadedBy.toString() !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: "You can only replace documents you uploaded",
      });
    }

    // Check if current time is before appointment time
    if (appointment.appointmentDateTime) {
      const now = moment();
      const apptTime = moment(appointment.appointmentDateTime);

      if (now.isAfter(apptTime)) {
        fs.unlinkSync(req.file.path);
        return res.status(403).json({
          success: false,
          message: "Cannot replace documents after the appointment time",
        });
      }
    }

    // Delete old file from disk
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Determine category for new file
    const category = determineCategory(appointment.appointmentDateTime);

    // Move new file to category folder
    const newFilePath = moveFileToCategory(
      req.file.path,
      appointmentId,
      category,
      req.file.filename
    );

    // Update document fields
    document.filename = req.originalFilename || req.file.originalname;
    document.storedFilename = req.file.filename;
    document.filepath = newFilePath;
    document.fileType = getFileType(req.file.mimetype);
    document.mimeType = req.file.mimetype;
    document.fileSize = req.file.size;
    document.uploadedAt = new Date();
    document.category = category;

    await appointment.save();

    // Populate and return updated document
    const populatedAppointment = await appointmentModel
      .findById(appointmentId)
      .populate('documents.uploadedBy', 'firstName lastName email');

    const updatedDocument = populatedAppointment.documents.id(documentId);

    res.status(200).json({
      success: true,
      message: "Document replaced successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Replace error:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error replacing document",
      error: error.message,
    });
  }
};

// 5. Add Comment to Document (Doctor only)
const addDocumentCommentController = async (req, res) => {
  try {
    const { appointmentId, documentId } = req.params;
    const { text } = req.body;
    const userId = req.body.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a doctor
    if (!user.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Only doctors can add comments to documents",
      });
    }

    // Check if user is the assigned doctor
    if (appointment.doctorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only comment on your assigned appointments",
      });
    }

    // Find document
    const document = appointment.documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Add comment
    const comment = {
      userId: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    document.comments.push(comment);
    await appointment.save();

    // Get the newly added comment
    const addedComment = document.comments[document.comments.length - 1];

    // Populate user info
    const populatedAppointment = await appointmentModel
      .findById(appointmentId)
      .populate('documents.comments.userId', 'firstName lastName email');

    const populatedDocument = populatedAppointment.documents.id(documentId);
    const populatedComment = populatedDocument.comments.id(addedComment._id);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// 6. Update General Notes (Doctor only)
const updateGeneralNotesController = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;
    const userId = req.body.userId;

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is a doctor
    if (!user.isDoctor) {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update appointment notes",
      });
    }

    // Check if user is the assigned doctor
    if (appointment.doctorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update notes for your assigned appointments",
      });
    }

    // Update notes
    appointment.generalNotes = notes || '';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      generalNotes: appointment.generalNotes,
    });
  } catch (error) {
    console.error("Update notes error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notes",
      error: error.message,
    });
  }
};

// 7. Delete Document (Admin only - optional)
const deleteDocumentController = async (req, res) => {
  try {
    const { appointmentId, documentId } = req.params;
    const userId = req.body.userId;

    // Find user
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete documents",
      });
    }

    // Find appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Find document
    const document = appointment.documents.id(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Remove document from array
    document.remove();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocumentController,
  getDocumentsController,
  downloadDocumentController,
  replaceDocumentController,
  addDocumentCommentController,
  updateGeneralNotesController,
  deleteDocumentController,
};
