/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Input,Checkbox } from "antd";
import ToastMessage from "@/components/common/Toast";
interface ValidationErrors {
  host?: string;
  port?: string;
  user_name?: string;
  from_name?: string;
  password?: string;
  encryption?: string;
}

export default function AllDocTable() {
  const isAuthenticated = useAuth();
const router = useRouter()
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [user_name, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [from_name, setFromName] = useState("");
  const [selectedEncryption, setSelectedEncryption] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDefault, setisDefault] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleEncryptionSelect = (encryption: string) => {
    setSelectedEncryption(encryption);
  };

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
      const response = await postWithAuth("add-smtp", formData);
      console.log("Form submitted successfully:", response);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("SMTP Details added successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        router.push("/email-smtp")
      } else if (response.status === "fail") {
        if (response.errors) {
          setErrors({
            host: response.errors.host?.[0] || "",
            port: response.errors.port?.[0] || "",
            user_name: response.errors.user_name?.[0] || "",
            from_name: response.errors.from_name?.[0] || "",
            password: response.errors.password?.[0] || "",
            encryption: response.errors.encryption?.[0] || "",
          });
        }
        setToastType("error");
        setToastMessage("SMTP Details add failed.");
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
          <Heading text="Add Email SMTP Setting" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          >
            <div className="p-0 row row-cols-1 row-cols-md-3 overflow-hidden w-100">
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Host
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className={errors.host ? "is-invalid" : ""}
                  />
                  {errors.host && <div className="invalid-feedback">{errors.host}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                  Port
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className={errors.port ? "is-invalid" : ""}
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
                  <Input
                    placeholder=""
                    type="text"
                    value={user_name}
                    onChange={(e) => setUserName(e.target.value)}
                    className={errors.user_name ? "is-invalid" : ""}
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
            </div>
          </div>

          <div className="d-flex flex-row justify-content-end mt-2 mt-lg-4">
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-sm px-3"
            >
              <IoSaveOutline className="me-2" />
              Submit
            </button>
          </div>
        </div>
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayout>
    </>
  );
}
