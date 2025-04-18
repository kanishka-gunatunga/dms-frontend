/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Heading from "@/components/common/Heading";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import ToastMessage from "@/components/common/Toast";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import DashboardLayoutSuperAdmin from "@/components/DashboardLayoutSuperAdmin";
import { Radio } from "antd";
import { IoSaveOutline } from "react-icons/io5";



export default function AllDocTable() {
    const isAuthenticated = useAuth();

    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const [selectedOption, setSelectedOption] = useState<"gpt" | "pinecone" | "limit" | "" | null>(null);
    const [pageCount, setPageCount] = useState<number | "">("");



    const fetchCompanyProfile = async () => {
        try {
            const response = await getWithAuth(`company-profile`);
            console.log("response cp", response);

            if (response) {
                const { send_all_to_gpt, send_all_to_pinecone, set_page_limit, pages_count } = response;

                if (send_all_to_gpt === 1) {
                    setSelectedOption("gpt");
                } else if (send_all_to_pinecone === 1) {
                    setSelectedOption("pinecone");
                } else if (set_page_limit === 1) {
                    setSelectedOption("limit");
                }

                setPageCount(pages_count || "");
            }
        } catch (error) {
            console.error("Error fetching company profile:", error);
        }
    };

    useEffect(() => {
        fetchCompanyProfile()
    }, []);

    const handleSubmit = async () => {
        if (selectedOption !== "limit") {
            setPageCount("");
        }

        const formData = new FormData();
        formData.append("send_all_to_gpt", selectedOption === "gpt" ? "1" : "0");
        formData.append("send_all_to_pinecone", selectedOption === "pinecone" ? "1" : "0");
        formData.append("set_page_limit", selectedOption === "limit" ? "1" : "0");
        formData.append("pages_count", selectedOption === "limit" ? pageCount.toString() : "0");

        try {
            const response = await postWithAuth("set-ai-settings", formData);
            console.log("response : ", response)
            if (response.status === "success") {
                setToastType("success");
                setToastMessage("AI settings updated successfully!");
            } else {
                setToastType("error");
                setToastMessage("Failed to update AI settings!");
            }
        } catch (error) {
            console.error("Error updating AI settings:", error);
            setToastType("error");
            setToastMessage("Error occurred while updating AI settings.");
        } finally {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    };


    if (!isAuthenticated) return <LoadingSpinner />;

    return (
        <>
            <DashboardLayoutSuperAdmin>
                <div className="d-flex justify-content-between align-items-center pt-2">
                    <Heading text="AI Document Settings" color="#444" />
                </div>

                <div className="d-flex flex-column bg-white p-3 rounded mt-3 mb-5">
                    <label className="mb-2 fw-bold">Choose One Setting</label>
                    <Radio.Group
                        onChange={(e) => setSelectedOption(e.target.value)}
                        value={selectedOption}
                        className="mb-3"
                    >
                        <Radio value="gpt">Send all to GPT</Radio>
                        <Radio value="pinecone">Send all to Pinecone</Radio>
                        <Radio value="limit">Set page limit</Radio>
                    </Radio.Group>

                    {selectedOption === "limit" && (
                        <div className="d-flex flex-column bg-white rounded mt-2">
                            <div className="col-12 col-md-8 col-lg-6 d-flex flex-column flex-md-row">
                                <input
                                    id="previewExtensionInput"
                                    className="form-control"
                                    type="number"
                                    placeholder="Enter number of pages"
                                    value={pageCount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPageCount(value === "" ? "" : Number(value));
                                    }}

                                />
                            </div>
                        </div>
                    )}
                    <div className="d-flex flex-column bg-white  rounded mt-3">
                        <div className="col-12 col-md-8 col-lg-6 d-flex flex-column flex-md-row">
                            <button
                                onClick={handleSubmit}
                                className="custom-icon-button button-success px-3 py-1 rounded "
                            >
                                <IoSaveOutline className="me-2" />
                                Save
                            </button>
                        </div>
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