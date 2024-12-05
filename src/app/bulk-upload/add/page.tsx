"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import { postWithAuth } from "@/utils/apiClient";
import { useUserContext } from "@/context/userContext";
import ToastMessage from "@/components/common/Toast";

export default function AllDocTable() {
  const isAuthenticated = useAuth();
  const { userId } = useUserContext();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || files.length === 0) {
      setErrors({ document: "Please select at least one document." });
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append("documents[]", file, file.name);
    });

    setLoading(true);
    setError("");

    try {
      const response = await postWithAuth("bulk-upload", formData);
      if (response.status === "success") {
        setToastType("success");
        setToastMessage("Documents uploaded successfully!");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
        window.location.href = "/bulk-upload";
      } else {
        setToastType("error");
        setToastMessage("Failed to upload documents.");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setError("Failed to submit the form.");
      setToastType("error");
      setToastMessage("Error submitting the form.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Heading text="Upload Documents" color="#444" />
        </div>

        <div className="d-flex flex-column bg-white p-2 p-lg-3 rounded mt-3">
          <div
            style={{
              maxHeight: "380px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="custom-scroll"
          >
            <div className="d-flex flex-column">
              <div className="row row-cols-1 row-cols-lg-1 d-flex justify-content-around px-lg-3 mb-lg-3">
                <div className="col justify-content-center align-items-center p-0">
                  <p className="mb-1 text-start w-100" style={{ fontSize: "14px" }}>
                    Select Documents
                  </p>
                  <input
                    type="file"
                    id="document"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                    multiple
                    onChange={handleFileChange}
                    required
                  />
                  {errors.document && (
                    <span className="text-danger">{errors.document}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-danger">{error}</p>}

          <div className="d-flex flex-row mt-5">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="custom-icon-button button-success px-3 py-1 rounded me-2"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <IoSaveOutline fontSize={16} className="me-1" /> Save
                </>
              )}
            </button>
            <a
              href="/bulk-upload"
              className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
            >
              <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
            </a>
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
