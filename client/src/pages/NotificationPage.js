import React from "react";
import Layout from "./../components/Layout";
import { message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/NotificationPage.css";
import { setUser } from "../redux/features/userSlice";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  //   handle read notification
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/get-all-notification",
        {
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        dispatch(setUser(res.data.data));
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("somthing went wrong");
    }
  };

  // delete notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        dispatch(setUser(res.data.data));
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Somthing Went Wrong In Ntifications");
    }
  };

  const handleSingleNotification = async (index, path) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/mark-notification-read",
        { userId: user._id, notificationIndex: index },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        dispatch(setUser(res.data.data));
        navigate(path);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Unable to open notification");
    }
  };
  return (
    <Layout>
      <div className="notification-page">
        <div className="notification-header">
          <h4>Notifications</h4>
        </div>
        <Tabs>
          <Tabs.TabPane tab="Unread" key={0}>
            <div className="notification-actions">
              <h4 onClick={handleMarkAllRead}>
                Mark All Read
              </h4>
            </div>
            {user?.notifcation && user.notifcation.length > 0 ? (
              user.notifcation.map((notificationMgs, index) => (
                <div className="notification-card" key={index}>
                  <div
                    className="card-text"
                    onClick={() =>
                      handleSingleNotification(index, notificationMgs.onClickPath)
                    }
                  >
                    {notificationMgs.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <p>No unread notifications</p>
              </div>
            )}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Read" key={1}>
            <div className="notification-actions">
              <h4
                className="text-primary"
                onClick={handleDeleteAllRead}
              >
                Delete All Read
              </h4>
            </div>
            {user?.seennotification && user.seennotification.length > 0 ? (
              user.seennotification.map((notificationMgs, index) => (
                <div className="notification-card" key={index}>
                  <div
                    className="card-text"
                    onClick={() => navigate(notificationMgs.onClickPath)}
                  >
                    {notificationMgs.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <p>No read notifications</p>
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NotificationPage;