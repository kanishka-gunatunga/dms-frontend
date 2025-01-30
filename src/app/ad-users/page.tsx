/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayoutSuperAdmin from "@/components/DashboardLayoutSuperAdmin";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { postWithAuth,getWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoSaveOutline, } from "react-icons/io5";
import { Input,Checkbox } from "antd";
import ToastMessage from "@/components/common/Toast";
import { IoMdCloudDownload } from "react-icons/io";
interface ValidationErrors {
  tenant_id?: string;
  client_id?: string;
  client_secret?: string;
}

export default function AllDocTable() {
  const isAuthenticated = useAuth();
const router = useRouter()
  const [tenant_id, setTenantId] = useState("");
  const [client_id, setClientId] = useState("");
  const [client_secret, setClientSecret] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchCredentials();
    }
  }, [isAuthenticated]);


  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const fetchCredentials = async () => {
    try {
      const response = await getWithAuth("ad-credentials");
      console.log('response',response);
      if (response) {
        setTenantId(response.tenant_id || "");
        setClientId(response.client_id || "");
        setClientSecret(response.client_secret || "");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const validateFields = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    if (!tenant_id.trim()) newErrors.tenant_id = "Tenant ID is required.";
    if (!client_id.trim()) newErrors.client_id = "Client ID is required.";
    if (!client_secret.trim()) newErrors.client_secret = "Client Secret is required.";

    return newErrors;
  };
  
  const syncADUsers = async () => {

    try {
      const response = await getWithAuth("import-users");
      console.log('response',response);
      if (response) {
        setToastType("success");
        setToastMessage("Users Imported");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setToastType("error");
      setToastMessage("Failed to Import Users.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  };
  const handleSubmit = async () => {
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    const formData = new FormData();
    formData.append("tenant_id", tenant_id);
    formData.append("client_id", client_id);
    formData.append("client_secret", client_secret);

    try {
      const response = await postWithAuth("ad-credentials", formData);

      if (response.status === "success") {
        setToastType("success");
        setToastMessage("AD Credentials Updated");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
        router.push("/ad-users")
      } else if (response.status === "fail") {
        if (response.errors) {
          setErrors({
            tenant_id: response.errors.host?.[0] || "",
            client_id: response.errors.client_id?.[0] || "",
            client_secret: response.errors.client_secret?.[0] || "",
          });
        }
        setToastType("error");
        setToastMessage("Failed to add AD Details.");
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
      <DashboardLayoutSuperAdmin>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="AD Users" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          >
            <div className="p-0 row row-cols-1 row-cols-md-3 overflow-hidden w-100">
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Tenant ID
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={tenant_id}
                    onChange={(e) => setTenantId(e.target.value)}
                    className={errors.tenant_id ? "is-invalid" : ""}
                  />
                  {errors.tenant_id && <div className="invalid-feedback">{errors.tenant_id}</div>}
                </div>
              </div>
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Client ID
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={client_id}
                    onChange={(e) => setClientId(e.target.value)}
                    className={errors.client_id ? "is-invalid" : ""}
                  />
                  {errors.client_id && <div className="invalid-feedback">{errors.client_id}</div>}
                </div>
              </div>
             
              <div className="d-flex flex-column">
                <p className="mb-1" style={{ fontSize: "14px" }}>
                Client Secret
                </p>
                <div className="input-group mb-3 pe-lg-4">
                  <Input
                    placeholder=""
                    type="text"
                    value={client_secret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className={errors.client_secret ? "is-invalid" : ""}
                  />
                  {errors.client_secret && <div className="invalid-feedback">{errors.client_secret}</div>}
                </div>
              </div>

            </div>
          </div>

          <div className="d-flex flex-row justify-content-end mt-2 mt-lg-4">
            <button
              onClick={handleSubmit}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              <IoSaveOutline className="me-2" />
              Submit
            </button>
          </div>
          <div className="d-flex flex-row justify-content-start mt-2 mt-lg-4">
            <button
              onClick={syncADUsers}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              Sync Users From AD
            </button>
          </div>
        </div>
        <ToastMessage
          message={toastMessage}
          show={showToast}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      </DashboardLayoutSuperAdmin>
    </>
  );
}
