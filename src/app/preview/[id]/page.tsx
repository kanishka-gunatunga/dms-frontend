"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoClose, IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { RoleDropdownItem } from "@/types/types";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import ToastMessage from "@/components/common/Toast";
import { Input } from "antd";



interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?:string;
}




export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});


  const router = useRouter();


  useEffect(() => {
    fetchRoleData(setRoleDropDownData);
  }, []);

  useEffect(() => {
    console.log("Errors updated:", errors);
  }, [errors]);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roleDropDownData.find(
      (role) => role.id.toString() === roleId
    );

    if (selectedRole && !selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
      setRoles([...roles, selectedRole.role_name]);
    }
  };

  const handleRemoveRole = (roleName: string) => {
    const roleToRemove = roleDropDownData.find(
      (role) => role.role_name === roleName
    );

    if (roleToRemove) {
      setSelectedRoleIds(
        selectedRoleIds.filter((id) => id !== roleToRemove.id.toString())
      );
      setRoles(roles.filter((r) => r !== roleName));
    }
  };

  const validateFields = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
  
    if (!firstName.trim()) newErrors.first_name = "First name is required.";
    if (!lastName.trim()) newErrors.last_name = "Last name is required.";
    if (!mobileNumber.trim()) newErrors.mobile_no = "Mobile number is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!JSON.stringify(selectedRoleIds)) newErrors.role = "At least select one role.";
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_\-]).{8,}$/;
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.";
    }
  
    if (password !== confirmPassword) {
      newErrors.password_confirmation = "Passwords do not match.";
    } else if (!confirmPassword.trim()) {
      newErrors.password_confirmation = "Confirm password is required.";
    }
  
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
    formData.append("password", password);
    formData.append("password_confirmation", confirmPassword);
    formData.append("role", JSON.stringify(selectedRoleIds));
  
    try {
      const response = await postWithAuth("add-user", formData);
      console.log("Form submitted successfully:", response);
  
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("User added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        window.location.href = "/users";
      } else if (response.status === "fail") {
        if (response.errors) {
          setErrors({
            first_name: response.errors.first_name?.[0] || "",
            last_name: response.errors.last_name?.[0] || "",
            mobile_no: response.errors.mobile_no?.[0] || "",
            email: response.errors.email?.[0] || "",
            password: response.errors.password?.[0] || "",
            password_confirmation: response.errors.password_confirmation?.[0] || "",
            role: response.errors.role?.[0] || "",
          });
        }
        setToastType("error");
        setToastMessage("User add failed.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
  
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="View Shared Document" color="#444" />
        </div>

        {/* <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
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
                  <Input
                    placeholder=""
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.first_name ? "is-invalid" : ""}
                  />
                  {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Last Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.last_name ? "is-invalid" : ""}
                  />
                  {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                </div>

              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Mobile Number
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={errors.mobile_no ? "is-invalid" : ""}
                  />
                  {errors.mobile_no && <div className="invalid-feedback">{errors.mobile_no}</div>}
                </div>

              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Email
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "is-invalid" : ""}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Password
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input.Password
                    placeholder="input password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "is-invalid" : ""}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Confirm Password
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input.Password
                    placeholder="input password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={errors.password_confirmation ? "is-invalid" : ""}
                  />
                  {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation}</div>}
                </div>

              </div>
              <div className="col-12 col-lg-6 d-flex flex-column">
                <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                  Roles
                </p>
                <div className="d-flex flex-column position-relative">
                  <DropdownButton
                    id="dropdown-category-button"
                    title={
                      roles.length > 0 ? roles.join(", ") : "Select Roles"
                    }
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
                      <Dropdown.Item disabled>
                        No Roles available
                      </Dropdown.Item>
                    )}
                  </DropdownButton>
                  {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                  <div className="mt-1">
                    {roles.map((role, index) => (
                      <span
                        key={index}
                        className="badge bg-primary text-light me-2 p-2 d-inline-flex align-items-center"
                      >
                        {role}
                        <IoClose
                          className="ms-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveRole(role)}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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
        </div> */}
      </DashboardLayout>
      <ToastMessage
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </>
  );
}
