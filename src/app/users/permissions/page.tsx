"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";

export default function AllDocTable() {
  const isAuthenticated = useAuth();

  const [firstName, setFirstName] = useState("");
  // const [success, setSuccess] = useState("");
  const router = useRouter();

  if (!isAuthenticated) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("first_name", firstName);

    try {
      // const response = await postWithAuth("add-user", formData);
      // console.log("Form submitted successfully:", response);
      // setSuccess("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
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
            </div>
          </div>
          {/* {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>} */}

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
