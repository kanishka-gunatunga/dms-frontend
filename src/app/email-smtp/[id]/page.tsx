/* eslint-disable @typescript-eslint/no-unused-vars */
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
import ToastMessage from "@/components/common/Toast";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import { RoleDropdownItem } from "@/types/types";
import { Input,Checkbox } from "antd";
import withPermission from "@/components/common/withPermission";
type Params = {
  id: string;
};

interface Props {
  params: Params;
}

interface ValidationErrors {
  host?: string;
  port?: string;
  user_name?: string;
  from_name?: string;
  password?: string;
  encryption?: string;
}


function AllDocTable({ params }: Props) {
  const isAuthenticated = useAuth();

  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [from_name, setFromName] = useState("");
  const [selectedEncryption, setSelectedEncryption] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [roleDropDownData, setRoleDropDownData] = useState<RoleDropdownItem[]>(
    []
  );
  const [isDefault, setisDefault] = useState<boolean>(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const handleEncryptionSelect = (encryption: string) => {
    setSelectedEncryption(encryption);
  };
 
  const router = useRouter();
  const id = params?.id;

  
  useEffect(() => {
    fetchRoleData(setRoleDropDownData);
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getWithAuth(`smtp-details/${id}`);
        setHost(response.host || "");
        setPort(response.port || "");
        setUserName(response.user_name?.toString() || "");
        setPassword(response.password || "");
        setFromName(response.from_name || "");
        setSelectedEncryption(response.encryption || "");
        setSelectedEncryption(response.is_default || "0");
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    if (id) {
      fetchUserDetails();
    }
  }, [id]);


  useEffect(() => {
    const initialRoles = roleDropDownData
      .filter((role) => selectedRoleIds.includes(role.id.toString()))
      .map((role) => role.role_name);

    setRoles(initialRoles);
  }, [selectedRoleIds, roleDropDownData]);

  // const handleRoleSelect = (roleId: string) => {
  //   const selectedRole = roleDropDownData.find(
  //     (role) => role.id.toString() === roleId
  //   );

  //   if (selectedRole && !selectedRoleIds.includes(roleId)) {
  //     setSelectedRoleIds([...selectedRoleIds, roleId]);
  //     setRoles([...roles, selectedRole.role_name]);
  //   }
  // };

  // const handleRemoveRole = (roleName: string) => {
  //   const roleToRemove = roleDropDownData.find(
  //     (role) => role.role_name === roleName
  //   );

  //   if (roleToRemove) {
  //     setSelectedRoleIds(
  //       selectedRoleIds.filter((id) => id !== roleToRemove.id.toString())
  //     );
  //     setRoles(roles.filter((r) => r !== roleName));
  //   }
  // };


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  const validateFields = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
  
    if (!host.trim()) newErrors.host = "Host is required.";
    if (!port.trim()) newErrors.port = "Port is required.";
    if (!from_name.trim()) newErrors.from_name = "From Name is required.";
    if (!user_name.trim()) newErrors.user_name = "User Name is required.";
    if (!selectedEncryption) newErrors.encryption = "Encryption is required.";
    if (!password.trim()) {
      newErrors.password = "Password is required.";
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
    formData.append("host", host);
    formData.append("port", port);
    formData.append("user_name", user_name);
    formData.append("password", password);
    formData.append("from_name", from_name);
    formData.append("encryption", selectedEncryption);
    formData.append("is_default", isDefault ? "1" : "0");
   
    try {
      const response = await postWithAuth(`smtp-details/${id}`, formData);
      if(response.status === "fail"){
        setToastType("error");
        setToastMessage("Failed to update SMTP Details!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
      setToastType("success");
        setToastMessage("SMTP Details updated successfully!");
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
          <Heading text="Edit SMTP Details" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          >
            <div className="p-0 row row-cols-1 row-cols-md-2 overflow-hidden w-100">
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Host
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className={`${errors.host ? "is-invalid" : ""} form-control`}
                  />
                  {errors.host && <div className="invalid-feedback">{errors.host}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Port
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    className={`${errors.port ? "is-invalid" : ""} form-control`}
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                  />
                   {errors.port && <div className="invalid-feedback">{errors.port}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Encryption
                </p>
                <div className="input-group mb-3 pe-lg-4">
                <DropdownButton
                    id="dropdown-encryption-button"
                    title={selectedEncryption || "Select Encryption"}
                    className="custom-dropdown-text-start text-start w-100"
                  >
                    {["none", "ssl", "tls", "starttls"].map((enc) => (
                      <Dropdown.Item
                        key={enc}
                        onClick={() => handleEncryptionSelect(enc)}
                      >
                        {enc}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                  {errors.encryption && (
                    <div className="invalid-feedback">{errors.encryption}</div>
                  )}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                User Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <input
                    type="text"
                    className={`${errors.user_name ? "is-invalid" : ""} form-control`}
                    value={user_name}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                   {errors.user_name && <div className="invalid-feedback">{errors.user_name}</div>}
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
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  From Name
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    value={from_name}
                    onChange={(e) => setFromName(e.target.value)}
                    className={errors.from_name ? "is-invalid" : ""}
                  />
                  {errors.from_name && (
                    <div className="invalid-feedback">
                      {errors.from_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="d-flex flex-column">
                  <label className="d-flex flex-row mt-3">
                      <Checkbox
                        checked={isDefault}
                        onChange={() => setisDefault(!isDefault)}
                        className="me-2"
                      >
                        <p
                          className="mb-0 text-start w-100"
                          style={{ fontSize: "14px" }}
                        >
                          Is Default
                        </p>

                      </Checkbox>
                    </label>
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

export default withPermission(AllDocTable, { group: "Email", action: "Manage SMTP Settings" });
