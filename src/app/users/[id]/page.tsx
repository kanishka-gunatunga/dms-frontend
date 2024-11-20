"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

type Params = {
  id: string;
};

interface Props {
  params: Params;
}

export default function AllDocTable({ params }: Props) {
  const isAuthenticated = useAuth();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getWithAuth(`user-details/${id}`);
        console.log("user details : ", response);
        setFirstName(response.user_details.first_name || "");
        console.log("user details f : ", response.user_details.first_name);
        setLastName(response.user_details.last_name || "");
        console.log("user details l : ", response.user_details.last_name);
        setMobileNumber(response.user_details.mobile_no?.toString() || "");
        setEmail(response.email || "");
        console.log("user details e : ", response.email);
        setRole(response.role || "");
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("mobile_no", mobileNumber);
    formData.append("email", email);
    formData.append("role", role);

    try {
      const response = await postWithAuth(`user-details/${id}`, formData);
      console.log("Form submitted successfully:", response);
      setSuccess("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Error submitting form, Please try again");
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
              <div className="d-flex"></div>
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
