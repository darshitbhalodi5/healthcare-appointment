const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "first name is required"],
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: [true, "mobile number is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  address: {
    type: String,
    required: [true, "address is required"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "date of birth is required"],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailOTP: {
    type: String,
  },
  emailOTPExpiry: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  notifcation: {
    type: Array,
    default: [],
  },
  seennotification: {
    type: Array,
    default: [],
  },
  pushSubscription: {
    type: Object,
    default: null
  }
}, {
  timestamps: true,
});

// Pre-save hook to set name field
userSchema.pre('save', function(next) {
  if (this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  next();
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;