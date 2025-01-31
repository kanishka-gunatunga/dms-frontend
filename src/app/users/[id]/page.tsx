/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import ToastMessage from "@/components/common/Toast";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import { RoleDropdownItem } from "@/types/types";
import withPermission from "@/components/common/withPermission";

type Params = {
  id: string;
};

interface Props {
  params: Params;
}

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  email?: string;
  role?: string;
}


function AllDocTable({ params }: Props) {
  const isAuthenticated = useAuth();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);


  const router = useRouter();
  const id = params?.id;


  useEffect(() => {
    fetchRoleData(setRoleDropDownData);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getWithAuth(`user-details/${id}`);
        setFirstName(response.user_details.first_name || "");
        setLastName(response.user_details.last_name || "");
        setMobileNumber(response.user_details.mobile_no?.toString() || "");
        setEmail(response.email || "");
        const roleIds = parseRoles(response.role);

        setSelectedRoleIds(roleIds);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const parseRoles = (roleData: any): string[] => {
    if (typeof roleData === "string") {
      const cleanedData = roleData.replace(/[^0-9,]/g, '');
      return cleanedData.split(',').filter((roleId) => roleId.trim() !== "");
    }
    return [];
  };

  useEffect(() => {
    const initialRoles = roleDropDownData
      .filter((role) => selectedRoleIds.includes(role.id.toString()))
      .map((role) => role.role_name);

    setRoles(initialRoles);
  }, [selectedRoleIds, roleDropDownData]);

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roleDropDownData.find(
      (role) => role.id.toString() === roleId
    );

    if (selectedRole && !selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds((prev) => [...prev, roleId]);
      setRoles((prev) => [...prev, selectedRole.role_name]);
    }
  };

  const handleRemoveRole = (roleId: string) => {
    const roleToRemove = roleDropDownData.find(
      (role) => role.id.toString() === roleId
    );

    if (roleToRemove) {
      setSelectedRoleIds((prev) =>
        prev.filter((id) => id !== roleToRemove.id.toString())
      );
      setRoles((prev) => prev.filter((r) => r !== roleToRemove.role_name));
    }
  };



  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  const validateFields = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!firstName.trim()) newErrors.first_name = "First name is required.";
    if (!lastName.trim()) newErrors.last_name = "Last name is required.";
    if (!mobileNumber.trim()) newErrors.mobile_no = "Mobile number is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!JSON.stringify(selectedRoleIds)) newErrors.role = "At least select one role.";

    return newErrors;
  };
  const handleSubmit = async () => {

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("mobile_no", mobileNumber);
    formData.append("email", email);
    formData.append("role", JSON.stringify(selectedRoleIds));

    
    try {
      const response = await postWithAuth(`user-details/${id}`, formData);
      if (response.status === "fail") {
        setToastType("error");
        setToastMessage("Failed to update user!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
      setToastType("success");
      setToastMessage("User Updated successfully!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // setSuccess("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Manage Users" color="#444" />
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`${errors.first_name ? "is-invalid" : ""} form-control`}
                  />
                  {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Last Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    className={`${errors.last_name ? "is-invalid" : ""} form-control`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Mobile Number
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="number"
                    className={`${errors.mobile_no ? "is-invalid" : ""} form-control`}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                  {errors.mobile_no && <div className="invalid-feedback">{errors.mobile_no}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Email
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="email"
                    className={`${errors.email ? "is-invalid" : ""} form-control`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Roles
                </p>
                <div className="mb-3 pe-lg-4">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={roles.length > 0 ? roles.join(", ") : "Select Roles"}
                    className="custom-dropdown-text-start text-start w-100"
                    onSelect={(value) => {
                      if (value) handleRoleSelect(value);
                    }}
                  >
                    {roleDropDownData.length > 0 ? (
                      roleDropDownData.map((role) => (
                        <Dropdown.Item key={role.id} eventKey={role.id}>
                          {role.role_name}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled>No Roles available</Dropdown.Item>
                    )}
                  </DropdownButton>

                  {errors.role && <div className="invalid-feedback">{errors.role}</div>}

                  <div className="mt-1">
                    {roles.map((roleName, index) => {
                      const role = roleDropDownData.find((r) => r.role_name === roleName);
                      return role ? (
                        <span
                          key={index}
                          className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                        >
                          {roleName}
                          <IoClose
                            className="ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleRemoveRole(role.id.toString())} // Pass role.id here
                          />
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

              </div>
              <div className="d-flex"></div>
            </div>
          </div>
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
      {/* toast message */}
      <ToastMessage
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  );
}

export default withPermission(AllDocTable, { group: "User", action: "Edit User" });
