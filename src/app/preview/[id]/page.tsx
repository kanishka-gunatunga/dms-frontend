/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { RoleDropdownItem } from "@/types/types";
import { fetchRoleData } from "@/utils/dataFetchFunctions";
import ToastMessage from "@/components/common/Toast";
import { Input } from "antd";
import { IoSendSharp } from "react-icons/io5";



interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  mobile_no?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
}

type Params = {
  id: string;
};

interface Props {
  params: Params;
}


export default function AllDocTable({ params }: Props) {
  const isAuthenticated = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [downloadable, setDownloadable] = useState("");

  // const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    console.log("shareCode : ", id)

    const fetchLinkStatus = async () => {
      try {
        const response = await getWithAuth(`unlock-shareble-link/${id}`);
        console.log("response : ", response)
        if (response.status === "fail" && response.message === "Need the password to unlock") {
          setRequiresPassword(true);
        } else {
          setMessage("Link unlocked successfully!");

        }
      } catch (error) {
        setErrors({ api: "Failed to load the link. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkStatus();
  }, []);

  const handlePasswordSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("password", password);

      // formData.forEach((value, key) => {
      //   console.log(`${key}: ${value}`);
      // });

      const response = await postWithAuth(
        `unlock-shareble-link/${id}`,
        formData
      );
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Successful!");
        setDocUrl(response.link)
        setDownloadable(response.allow_download)
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setToastType("error");
        setToastMessage(`${response.message}`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setToastType("error");
      setToastMessage("Failed to upload the new version!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      // console.error("Error new version updating:", error);
    }

  };



  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }


  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="View Shared Document" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          {/* <div
            style={{ maxHeight: "380px", overflowY: "auto" }}
            className="custom-scroll"
          > */}
          <div className="p-0 overflow-hidden w-100">
            <div className="d-flex flex-column align-items-start">
              {requiresPassword ? (

                <div className="d-flex flex-column">
                  <div className="d-flex flex-column mt-3">
                    <label htmlFor="password">Password</label>
                    <Input.Password
                      placeholder="Input password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="is-invalid"
                    />
                  </div>
                  <button
                    onClick={
                      handlePasswordSubmit
                    }
                    className="custom-icon-button button-success px-3 py-1 rounded me-2 mt-3"
                  >
                    <IoSendSharp fontSize={16} className="me-1" /> Submit
                  </button>
                </div>
              ) : (
                <div className="success-message">{message}</div>
              )}
            </div>
          </div>
          <iframe
            src={docUrl}
            title="PDF Preview"
            style={{ width: "100%", height: "500px", border: "none" }}
          ></iframe>
          {/* </div> */}

        </div>
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
