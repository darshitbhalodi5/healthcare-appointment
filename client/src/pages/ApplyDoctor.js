import React from "react";
import Layout from "./../components/Layout";
import { Col, Form, Input, Row, TimePicker, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import { getUserTimezone, localTimeToUTCTime, getTimezoneDisplayName } from "../utils/timezoneUtils";
import "../styles/ApplyDoctor.css";

const ApplyDoctor = () => {
  const { user } = useSelector((state) => state.user);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const doctorTimezone = getUserTimezone();
  const timezoneDisplay = getTimezoneDisplayName(doctorTimezone);

  // Set initial values from user data
  const initialValues = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.mobileNumber || "",
    address: user?.address || "",
    // website is not in user model, so leave it empty for user to fill
  };

  //handle form
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());

      // Convert timings from doctor's timezone to UTC before saving
      let formattedTimings = [];
      if (values.timings && values.timings.length === 2) {
        // Get times in doctor's timezone (HH:mm format)
        const localStartTime = values.timings[0].format("HH:mm");
        const localEndTime = values.timings[1].format("HH:mm");
        
        // Convert to UTC
        const utcStartTime = localTimeToUTCTime(localStartTime, doctorTimezone);
        const utcEndTime = localTimeToUTCTime(localEndTime, doctorTimezone);
        
        formattedTimings = [utcStartTime, utcEndTime];
      }

      const res = await axios.post(
        "/api/v1/user/apply-doctor",
        {
          ...values,
          userId: user._id,
          timings: formattedTimings,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  return (
    <Layout>
      <div className="apply-doctor-page">
        <div className="apply-doctor-header">
          <h1>Apply as a Doctor</h1>
          <p>Fill in your professional details to register as a doctor on our platform</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={initialValues}
          className="apply-doctor-form"
        >
          {/* Personal Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Personal Details</h3>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: "First name is required" }]}
                >
                  <Input disabled placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: "Last name is required" }]}
                >
                  <Input disabled placeholder="Last Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: "Email is required" }]}
                >
                  <Input disabled type="email" placeholder="Email Address" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: "Phone number is required" }]}
                >
                  <Input disabled placeholder="Phone Number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Clinic Address"
                  name="address"
                  rules={[{ required: true, message: "Address is required" }]}
                >
                  <Input disabled placeholder="Clinic Address" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item label="Website" name="website">
                  <Input placeholder="Website" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Professional Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>Professional Details</h3>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Specialization"
                  name="specialization"
                  rules={[{ required: true, message: "Specialization is required" }]}
                >
                  <Input placeholder="e.g., Cardiologist, Dentist" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Experience (Years)"
                  name="experience"
                  rules={[{ required: true, message: "Experience is required" }]}
                >
                  <Input type="number" placeholder="Years of Experience" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label="Consultation Fee ($)"
                  name="feesPerCunsaltation"
                  rules={[{ required: true, message: "Fee is required" }]}
                >
                  <Input type="number" placeholder="Consultation Fee" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Form.Item
                  label={`Available Timings (${timezoneDisplay})`}
                  name="timings"
                  rules={[{ required: true, message: "Timings are required" }]}
                >
                  <TimePicker.RangePicker
                    format="HH:mm"
                    placeholder={[`Start Time (${timezoneDisplay})`, `End Time (${timezoneDisplay})`]}
                    className="timings-picker"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button className="btn-submit-application" type="submit">
              <i className="fa-solid fa-paper-plane"></i>
              Submit Application
            </button>
          </div>
        </Form>
      </div>
    </Layout>
  );
};

export default ApplyDoctor;