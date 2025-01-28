/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Heading from "@/components/common/Heading";
import DashboardLayout from "@/components/DashboardLayout";
import useAuth from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getWithAuth, postWithAuth } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { IoSaveOutline } from "react-icons/io5";
import { MdOutlineCancel } from "react-icons/md";
import ToastMessage from "@/components/common/Toast";
import { useUserContext } from "@/context/userContext";
import { FaKey } from "react-icons/fa6";
import { Modal } from "react-bootstrap";

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

export default function AllDocTable({ }: Props) {
    const isAuthenticated = useAuth();
    const { userId, email } = useUserContext();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [mobileNumber, setMobileNumber] = useState<string>("");
    const [myEmail, setMyEmail] = useState<string>(email || '');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [password, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await getWithAuth(`user-details/${userId}`);
                // console.log("user details : ", response);
                setFirstName(response.user_details.first_name || "");
                // console.log("user details f : ", response.user_details.first_name);
                setLastName(response.user_details.last_name || "");
                // console.log("user details l : ", response.user_details.last_name);
                setMobileNumber(response.user_details.mobile_no?.toString() || "");
                setMyEmail(response.email || "");
                // console.log("user roles : ", response.role);
                const roleIds = parseRoles(response.role);

                setSelectedRoleIds(roleIds);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            }
        };

        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    const parseRoles = (roleData: any): string[] => {
        if (typeof roleData === "string") {
            const cleanedData = roleData.replace(/[^0-9,]/g, "");
            return cleanedData.split(",").filter((roleId) => roleId.trim() !== "");
        }
        return [];
    };

    if (!isAuthenticated) {
        return <LoadingSpinner />;
    }

    const validateFields = (): ValidationErrors => {
        const newErrors: ValidationErrors = {};

        if (!firstName.trim()) newErrors.first_name = "First name is required.";
        if (!lastName.trim()) newErrors.last_name = "Last name is required.";
        if (!mobileNumber.trim())
            newErrors.mobile_no = "Mobile number is required.";
        if (!myEmail.trim()) newErrors.email = "Email is required.";
        if (!JSON.stringify(selectedRoleIds))
            newErrors.role = "At least select one role.";

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
        formData.append("email", myEmail);
        formData.append("role", JSON.stringify(selectedRoleIds));

        // for (const [key, value] of formData.entries()) {
        //     console.log(`Document share: ${key}: ${value}`);
        // }
        try {
            const response = await postWithAuth(`user-details/${userId}`, formData);
            // console.log("Form submitted successfully:", response);
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


    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        setShow(false);
    };

    const validateForm = () => {
        if (!password || !confirmPassword) {
            setError("All fields are required.");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        const passwordRegex = /^.{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must be at least 8 characters long and contain at least one capital letter, one number, and one special character."
            );
            return false;
        }

        setError("");
        return true;
    };

    const handleResetPassword = async () => {
        if (validateForm()) {
            const formData = new FormData();
            formData.append("email", email || "");
            formData.append("current_password", currentPassword);
            formData.append("password", password);
            formData.append("password_confirmation", confirmPassword);

            try {
                const response = await postWithAuth("update-password", formData);
                // console.log("Form submitted successfully:", response);
                if (response.status === "fail") {
                    setToastType("error");
                    setToastMessage("Failed to reset password!");
                    setShowToast(true);
                    setTimeout(() => {
                        setShowToast(false);
                    }, 5000);
                } else {
                    setToastType("success");
                    setToastMessage("Reset Password Successful!");
                    setShowToast(true);
                    setTimeout(() => {
                        setShowToast(false);
                    }, 5000);
                }

                handleClose();
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
    };
    return (
        <>
            <DashboardLayout>

                <div className="d-flex justify-content-between align-items-center pt-2">
                    <div className="d-flex flex-row align-items-center">
                        <Heading text="Profile" color="#444" />
                    </div>
                    <div className="d-flex flex-row">
                        <button
                            onClick={() => handleShow()}
                            className="addButton me-2 bg-white text-dark border border-success rounded px-3 py-1"
                        >
                            <FaKey className="me-1" /> Change Password
                        </button>
                    </div>
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
                                        className={`${errors.first_name ? "is-invalid" : ""
                                            } form-control`}
                                    />
                                    {errors.first_name && (
                                        <div className="invalid-feedback">{errors.first_name}</div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Last Name
                                </p>
                                <div className="input-group mb-3 pe-lg-4">
                                    <input
                                        type="text"
                                        className={`${errors.last_name ? "is-invalid" : ""
                                            } form-control`}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                    {errors.last_name && (
                                        <div className="invalid-feedback">{errors.last_name}</div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Mobile Number
                                </p>
                                <div className="input-group mb-3 pe-lg-4">
                                    <input
                                        type="number"
                                        className={`${errors.mobile_no ? "is-invalid" : ""
                                            } form-control`}
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                    />
                                    {errors.mobile_no && (
                                        <div className="invalid-feedback">{errors.mobile_no}</div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Email
                                </p>
                                <div className="input-group mb-3 pe-lg-4">
                                    <input
                                        type="email"
                                        className={`${errors.email ? "is-invalid" : ""
                                            } form-control`}
                                        value={myEmail}
                                        onChange={(e) => setMyEmail(e.target.value)}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
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
                            onClick={() => router.push("/")}
                            className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                        >
                            <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                        </button>
                    </div>
                </div>
            </DashboardLayout>
            <Modal
                show={show}
                onHide={handleClose}
                centered
                className="smallModel"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <div className="d-flex flex-row align-items-center">
                            <Heading text="Reset Password" color="#444" />{" "}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className="custom-scroll"
                        style={{ maxHeight: "70vh", overflowY: "scroll" }}
                    >
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Email
                                </p>
                                <div className="input-group mb-3">
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={myEmail || ""}
                                        onChange={(e) => setMyEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Current Password
                                </p>
                                <div className="input-group mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Password
                                </p>
                                <div className="input-group mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="d-flex flex-column">
                                <p className="mb-1" style={{ fontSize: "14px" }}>
                                    Confirm Password
                                </p>
                                <div className="input-group mb-3">
                                    <input
                                        type="password"
                                        className="form-control"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-danger">{error}</p>}
                        <div className="d-flex flex-row mt-2">
                            <button
                                onClick={handleResetPassword}
                                className="custom-icon-button button-success px-3 py-1 rounded me-2"
                            >
                                <IoSaveOutline fontSize={16} className="me-1" /> Save
                            </button>
                            <button
                                onClick={handleClose}
                                className="custom-icon-button button-danger text-white bg-danger px-3 py-1 rounded"
                            >
                                <MdOutlineCancel fontSize={16} className="me-1" /> Cancel
                            </button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
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
