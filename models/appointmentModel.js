const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorInfo: {
      type: String,
      required: true,
    },
    userInfo: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    time: {
      type: String,
      required: true,
    },

    // Document Management Fields
    documents: [{
      // File Information
      filename: {
        type: String,
        required: true,
      },
      storedFilename: {
        type: String,
        required: true,
      },
      filepath: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'image'],
      },
      mimeType: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },

      // Upload Metadata
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
      },
      uploaderRole: {
        type: String,
        required: true,
        enum: ['patient', 'doctor'],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },

      // Categorization
      category: {
        type: String,
        required: true,
        enum: ['pre-appointment', 'post-appointment'],
      },

      // Doctor Comments on This Document
      comments: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
    }],

    // General Doctor Notes
    generalNotes: {
      type: String,
      default: '',
    },

    // Computed appointment date-time for category determination
    appointmentDateTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;