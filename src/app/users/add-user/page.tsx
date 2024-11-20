"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("1");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one capital letter, one number, and one special character."
      );
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("mobile_no", mobileNumber);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("password_confirmation", confirmPassword);
      formData.append("role", role);

      try {
        const response = await postWithAuth("add-user", formData);
        console.log("Form submitted successfully:", response);
        setSuccess("Form submitted successfully");
        router.push("/users");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Add Users" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          >
            <div className="p-0 row row-cols-1 row-cols-md-2 overflow-hidden w-100">
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  First Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Last Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Mobile Number
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="number"
                    className="form-control"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Email
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Password
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Confirm Password
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Roles
                </p>
                <div className="mb-3 pe-lg-4">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={role}
                    className="custom-dropdown-text-start text-start "
                    onSelect={(value) => setRole(value || "")}
                  >
                    <Dropdown.Item eventKey="1">Manager</Dropdown.Item>
                    <Dropdown.Item eventKey="2">Employee</Dropdown.Item>
                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <div className="d-flex flex-row mt-5">
            <button
              onClick={handleSubmit}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline fontSize={16} className="me-1" /> Save
            </button>
            <button
              onClick={() => router.push("/users")}
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
