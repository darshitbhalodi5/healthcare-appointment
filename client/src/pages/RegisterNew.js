import React, { useState, useEffect } from "react";
import "../styles/RegisterStyles.css";
import { Form, Input, DatePicker, message } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import moment from "moment";

const RegisterNew = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1, 2, 3
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    dateOfBirth: null,
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");

  // Debug: Monitor step changes
  useEffect(() => {
    console.log("Current step:", step);
  }, [step]);

  // Step 1: Basic Details Handler
  const handleStep1Submit = (values) => {
    setFormData({
      ...formData,
      firstName: values.firstName,
      lastName: values.lastName,
      address: values.address,
      dateOfBirth: values.dateOfBirth,
    });
    setStep(2);
  };

  // Step 2: Account Details + Send OTP
  const handleStep2Submit = async (values) => {
    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    try {
      // Send OTP to email
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/send-otp", {
        email: values.email,
        firstName: formData.firstName,
      });
      dispatch(hideLoading());

      if (res.data.success) {
        // Save form data after successful OTP send
        const updatedFormData = {
          ...formData,
          email: values.email,
          mobileNumber: values.mobileNumber,
          password: values.password,
          confirmPassword: values.confirmPassword,
        };
        setFormData(updatedFormData);
        message.success(res.data.message);
        console.log("OTP sent successfully, moving to step 3");
        setStep(3); // Move to OTP verification step
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Failed to send OTP. Please try again.");
    }
  };

  // Step 3: Verify OTP and Complete Registration
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      message.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // First verify OTP
      dispatch(showLoading());
      const verifyRes = await axios.post("/api/v1/user/verify-otp", {
        email: formData.email,
        otp: otp,
      });

      if (!verifyRes.data.success) {
        dispatch(hideLoading());
        message.error(verifyRes.data.message);
        return;
      }

      // If OTP verified, complete registration
      const registerRes = await axios.post("/api/v1/user/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        dateOfBirth: moment(formData.dateOfBirth).format("YYYY-MM-DD"),
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      dispatch(hideLoading());

      if (registerRes.data.success) {
        message.success("Registration completed successfully!");
        navigate("/login");
      } else {
        message.error(registerRes.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Registration failed. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      address: "",
      dateOfBirth: null,
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    });
    setOtp("");
    setStep(1);
  };

  const handleResendOTP = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post("/api/v1/user/send-otp", {
        email: formData.email,
        firstName: formData.firstName,
      });
      dispatch(hideLoading());

      if (res.data.success) {
        message.success("OTP resent successfully!");
        setOtp(""); // Clear previous OTP
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="form-container">
      {/* Step 1: Basic Details */}
      {step === 1 && (
        <Form
          key="step1"
          layout="vertical"
          onFinish={handleStep1Submit}
          className="register-form"
          initialValues={formData}
        >
          <h3 className="text-center">Let's Get Started</h3>
          <p className="text-center" style={{ color: "#666", marginBottom: "20px" }}>
            Add Your Personal Details to Continue
          </p>

          <Form.Item label="Name" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: "First name is required" }]}
                style={{ flex: 1, marginBottom: "24px" }}
              >
                <Input placeholder="Darshit" />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[{ required: true, message: "Last name is required" }]}
                style={{ flex: 1, marginBottom: "24px" }}
              >
                <Input placeholder="Bhalodi" />
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <Input placeholder="Where commands run" />
          </Form.Item>

          <Form.Item
            label="Date of Birth"
            name="dateOfBirth"
            rules={[{ required: true, message: "Date of birth is required" }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              placeholder="Select Date of Birth"
            />
          </Form.Item>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, background: "#e3f2fd", color: "#1976d2" }}
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Next
            </button>
          </div>

          <Link to="/login" className="m-2">
            Already have an account? <strong>Login</strong>
          </Link>
        </Form>
      )}

      {/* Step 2: Account Creation Form */}
      {step === 2 && (
        <Form
          key="step2"
          layout="vertical"
          onFinish={handleStep2Submit}
          className="register-form"
          initialValues={formData}
        >
          <h3 className="text-center">Let's Get Started</h3>
          <p className="text-center" style={{ color: "#666", marginBottom: "20px" }}>
            It's Okay, Now Create User Account.
          </p>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input type="email" placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            label="Mobile Number"
            name="mobileNumber"
            rules={[{ required: true, message: "Mobile number is required" }]}
            getValueFromEvent={(value) => value}
          >
            <PhoneInput
              country={"in"}
              enableSearch={true}
              placeholder="ex: 0712345678"
              inputStyle={{ width: "100%", height: "40px" }}
            />
          </Form.Item>

          <Form.Item
            label="Create New Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="New Password" />
          </Form.Item>

          <Form.Item
            label="Conform Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Conform Password" />
          </Form.Item>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, background: "#e3f2fd", color: "#1976d2" }}
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Next
            </button>
          </div>

          <Link to="/login" className="m-2">
            Already have an account? <strong>Login</strong>
          </Link>
        </Form>
      )}

      {/* Step 3: OTP Verification */}
      {step === 3 && (
        <div key="step3" className="register-form">
          <h3 className="text-center">Verify Your Email</h3>
          <p className="text-center" style={{ color: "#666", marginBottom: "20px" }}>
            Enter the OTP sent to <strong>{formData.email}</strong>
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Enter OTP
            </label>
            <Input
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              style={{
                fontSize: "1.2rem",
                textAlign: "center",
                letterSpacing: "0.5rem",
                padding: "12px"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, background: "#e3f2fd", color: "#1976d2" }}
              onClick={handleResendOTP}
            >
              Resend OTP
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleVerifyAndRegister}
            >
              Sign Up
            </button>
          </div>

          <p
            className="text-center"
            style={{ marginTop: "20px", color: "#999", fontSize: "0.85rem" }}
          >
            Didn't receive the OTP? Check your spam folder or click Resend OTP
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterNew;
