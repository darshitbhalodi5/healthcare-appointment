import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Input, Select, Table } from "antd";
import "../../styles/Tables.css";
import "../../styles/AdminDoctors.css";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  //getUsers
  const getUsers = async () => {
    try {
      const res = await axios.get("/api/v1/admin/getAllUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleResize = () =>
      setIsMobileView(typeof window !== "undefined" ? window.innerWidth < 768 : false);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = (user.name || `${user.firstName || ""} ${user.lastName || ""}`).toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "doctor"
        ? user.isDoctor
        : !user.isDoctor;
    return matchesSearch && matchesRole;
  });

  // antD table col
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Doctor",
      dataIndex: "isDoctor",
      render: (text, record) => <span>{record.isDoctor ? "Yes" : "No"}</span>,
    },
  ];

  return (
    <Layout>
      <div className="table-container">
        <div className="table-header gradient">
          <h1>Users List</h1>
        </div>
        <div className="admin-controls stacked">
          <Input
            placeholder="Search user by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            options={[
              { value: "all", label: "All" },
              { value: "doctor", label: "Doctors" },
              { value: "user", label: "Patients" },
            ]}
          />
        </div>
        {isMobileView ? (
          <div className="admin-card-grid">
            {filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div className="doctor-card admin user-card" key={user._id}>
                  <div className="doctor-card-header">
                    <h3>{user.name || `${user.firstName} ${user.lastName}`}</h3>
                    <span
                      className={`status-badge ${
                        user.isDoctor ? "approved" : "pending"
                      }`}
                    >
                      {user.isDoctor ? "Doctor" : "User"}
                    </span>
                  </div>
                  <div className="doctor-card-body">
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user.mobileNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Address:</strong> {user.address || "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Users Found</h3>
                <p>Newly registered users will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Table columns={columns} dataSource={filteredUsers} rowKey="_id" />
            <div className="table-scroll-hint">
              Scroll horizontally to view all columns
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Users;